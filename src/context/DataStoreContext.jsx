import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { ROLES, fromApiAdmin, roleCode } from '../data/admins'
import { findAgent } from '../data/agents'
import { api, failure } from '../utils/api'

const DataStoreContext = createContext(null)

// Everything here now comes from the Django API, so nothing is kept in the browser.
// This was the key used while the app ran on mock data; old copies are cleared on load.
const LEGACY_STORAGE_KEY = 'empire_data_store_v2'

function emptyStore() {
  return {
    // Admin portal: every customer. Customer portal: just the signed-in customer.
    customers: [],
    products: [],
    productsLoaded: false,
    transactions: [],
    transactionsLoaded: false,
    // Customer: their own requests. Admin: everyone's, with the review trail
    withdrawals: [],
    withdrawalsLoaded: false,
    notifications: [],
    // From the server, so it's right even beyond the 100 most recent notifications loaded
    unreadCount: 0,
    // Written by the server as admins act; the portal only reads them
    auditLogs: [],
    bankAccounts: [],
    accountAssignments: {},
    // Super Admins only
    admins: [],
    agents: [],
  }
}

export function DataStoreProvider({ children }) {
  const [store, setStore] = useState(emptyStore)

  useEffect(() => {
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY)
    } catch {
      // storage unavailable; nothing to clear
    }
    refreshProducts()
  }, [])

  // The signed-in admin, set by AdminAuthProvider, for role checks before calling the API
  // (the server enforces the same rules).
  const actorRef = useRef(null)
  const setActor = (admin) => {
    actorRef.current = admin
  }
  const isSuperAdmin = () => actorRef.current?.role === ROLES.SUPER_ADMIN

  const patch = (updates) => setStore((prev) => ({ ...prev, ...updates }))

  // Runs an API call and returns { success, ...data } or the failure shape pages expect.
  // Admin changes are written to the audit log by the server, so refresh it afterwards.
  const call = async (path, options, { audited = false } = {}) => {
    try {
      const data = await api(path, options)
      if (audited) refreshAuditLogs()
      return { success: true, ...(data || {}) }
    } catch (err) {
      return failure(err)
    }
  }

  // ---- Audit log (admin portal, read-only) ----
  const refreshAuditLogs = async () => {
    const result = await call('/admin/audit-logs/')
    if (result.success) patch({ auditLogs: result.auditLogs })
    return result
  }

  // ---- Products ----
  // Customers and the public site see active products; admins see the whole catalogue.
  const refreshProducts = async (scope = 'public') => {
    const result = await call(scope === 'admin' ? '/admin/products/' : '/products/')
    patch(result.success ? { products: result.products, productsLoaded: true } : { productsLoaded: true })
    return result
  }

  const replaceProduct = (product) =>
    setStore((prev) => ({ ...prev, products: prev.products.map((p) => (p.id === product.id ? product : p)) }))

  const addProduct = async (data) => {
    const result = await call('/admin/products/', { method: 'POST', body: data }, { audited: true })
    if (result.success) setStore((prev) => ({ ...prev, products: [...prev.products, result.product] }))
    return result
  }

  const updateProduct = async (id, data) => {
    const result = await call(`/admin/products/${id}/`, { method: 'PATCH', body: data }, { audited: true })
    if (result.success) replaceProduct(result.product)
    return result
  }

  const toggleProductStatus = async (id) => {
    const product = store.products.find((p) => p.id === id)
    if (!product) return { success: false, error: 'Product not found.' }
    const status = product.status === 'active' ? 'disabled' : 'active'
    const result = await call(`/admin/products/${id}/`, { method: 'PATCH', body: { status } }, { audited: true })
    if (result.success) replaceProduct(result.product)
    return result
  }

  // Products customers have used can't be deleted (the server answers product_in_use)
  const deleteProduct = async (id) => {
    const result = await call(`/admin/products/${id}/`, { method: 'DELETE' }, { audited: true })
    if (result.success) setStore((prev) => ({ ...prev, products: prev.products.filter((p) => p.id !== id) }))
    return result
  }

  // ---- Transactions ----
  // Customers load their own; admins load everyone's, with the slip review trail.
  const replaceTransaction = (txn) =>
    setStore((prev) => ({ ...prev, transactions: prev.transactions.map((t) => (t.id === txn.id ? txn : t)) }))

  const refreshTransactions = async (scope = 'customer') => {
    const result = await call(scope === 'admin' ? '/admin/transactions/' : '/transactions/')
    patch(result.success ? { transactions: result.transactions, transactionsLoaded: true } : { transactionsLoaded: true })
    return result
  }

  // The server checks the product's limits, plan length and terms, and assigns the
  // reference, dates and payment account. Application documents are uploaded with it:
  // pass `files` as { key: File }.
  const createTransaction = async (payload, files = {}) => {
    const entries = Object.entries(files).filter(([, file]) => file)
    let body = payload
    if (entries.length) {
      body = new FormData()
      body.append('payload', JSON.stringify(payload))
      entries.forEach(([key, file]) => body.append(`document.${key}`, file))
    }
    const result = await call('/transactions/', { method: 'POST', body })
    if (result.success) setStore((prev) => ({ ...prev, transactions: [result.transaction, ...prev.transactions] }))
    return result
  }

  const attachReceipt = async (reference, file) => {
    const form = new FormData()
    form.append('file', file)
    const result = await call(`/transactions/${reference}/upload-receipt/`, { method: 'POST', body: form })
    if (result.success) replaceTransaction(result.transaction)
    return result
  }

  // ---- Payment slip review ----
  // Admins view and recommend; only a Super Admin's final decision credits or rejects.
  // The server keeps the slip trail, credits balances and writes the audit log.
  const findTxn = (id) => store.transactions.find((t) => t.id === id)

  const reviewAction = async (transactionId, action, body) => {
    const txn = findTxn(transactionId)
    if (!txn) return { success: false, error: 'Payment not found.' }
    const result = await call(`/admin/transactions/${txn.reference}/${action}/`, { method: 'POST', body }, { audited: true })
    if (result.success) replaceTransaction(result.transaction)
    return result
  }

  const recordSlipView = (transactionId) => {
    if (actorRef.current) reviewAction(transactionId, 'view')
  }

  // decision: 'approve' | 'reject'
  const recommendPayment = (transactionId, decision, note) =>
    reviewAction(transactionId, 'recommend', { decision, note: note || '' })

  const approvePayment = async (transactionId, note) => {
    if (!isSuperAdmin()) return { success: false, error: 'Only a Super Admin can give final approval.' }
    const result = await reviewAction(transactionId, 'approve', { note: note || '' })
    // The customer's balance changed on the server
    if (result.success) refreshCustomers()
    return result
  }

  const rejectPayment = (transactionId, reason) => {
    if (!isSuperAdmin()) return Promise.resolve({ success: false, error: 'Only a Super Admin can reject a payment.' })
    return reviewAction(transactionId, 'reject', { note: reason || '' })
  }

  // ---- Withdrawals ----
  // Customers request from a plan; an admin recommends, a Super Admin approves (the balance is
  // deducted on the server) or rejects, and an admin marks it paid with the transfer reference.
  const replaceWithdrawal = (wd) =>
    setStore((prev) => ({ ...prev, withdrawals: prev.withdrawals.map((w) => (w.id === wd.id ? { ...w, ...wd } : w)) }))

  const refreshWithdrawals = async (scope = 'customer') => {
    const result = await call(scope === 'admin' ? '/admin/withdrawals/' : '/withdrawals/')
    patch(result.success ? { withdrawals: result.withdrawals, withdrawalsLoaded: true } : { withdrawalsLoaded: true })
    return result
  }

  // The customer's approved plans, each with what can be withdrawn today and why not
  const getWithdrawablePlans = () => call('/withdrawals/plans/')

  // The server prices a withdrawal (penalty, payout, earliest date) using the product's rules
  const quoteWithdrawal = (planReference, amount) =>
    call('/withdrawals/quote/', { method: 'POST', body: { planReference, amount: amount === '' ? null : amount } })

  const requestWithdrawal = async (payload) => {
    const result = await call('/withdrawals/', { method: 'POST', body: payload })
    if (result.success) setStore((prev) => ({ ...prev, withdrawals: [result.withdrawal, ...prev.withdrawals] }))
    return result
  }

  const cancelWithdrawal = async (reference) => {
    const result = await call(`/withdrawals/${reference}/cancel/`, { method: 'POST' })
    if (result.success) replaceWithdrawal(result.withdrawal)
    return result
  }

  const getAdminWithdrawal = (reference) => call(`/admin/withdrawals/${reference}/`)

  const withdrawalAction = async (reference, action, body) => {
    const result = await call(`/admin/withdrawals/${reference}/${action}/`, { method: 'POST', body }, { audited: true })
    if (result.success) {
      replaceWithdrawal(result.withdrawal)
      // Approval moves the customer's balance on the server
      if (action === 'approve') refreshCustomers()
    }
    return result
  }

  // ---- Agents ----
  // Agents are deactivated rather than deleted, so customers linked to them stay intact.
  const replaceAgent = (agent) =>
    setStore((prev) => ({ ...prev, agents: prev.agents.map((a) => (a.code === agent.code ? agent : a)) }))

  const refreshAgents = async () => {
    const result = await call('/admin/agents/')
    if (result.success) patch({ agents: result.agents })
    return result
  }

  const agentPayload = (data) => ({ name: data.name.trim(), phone: data.phone.trim(), location: data.location.trim() })

  const createAgent = async (data) => {
    const result = await call('/admin/agents/', { method: 'POST', body: agentPayload(data) }, { audited: true })
    if (result.success) setStore((prev) => ({ ...prev, agents: [...prev.agents, result.agent] }))
    return result
  }

  const updateAgent = async (code, data) => {
    const result = await call(`/admin/agents/${code}/`, { method: 'PATCH', body: agentPayload(data) }, { audited: true })
    if (result.success) replaceAgent(result.agent)
    return result
  }

  const toggleAgentStatus = async (code) => {
    const agent = findAgent(store.agents, code)
    if (!agent) return { success: false, error: 'Agent not found.' }
    const status = agent.status === 'active' ? 'inactive' : 'active'
    const result = await call(`/admin/agents/${code}/`, { method: 'PATCH', body: { status } }, { audited: true })
    if (result.success) replaceAgent(result.agent)
    return result
  }

  // ---- Admin accounts (Super Admins only) ----
  const replaceAdmin = (admin) =>
    setStore((prev) => ({ ...prev, admins: prev.admins.map((a) => (a.id === admin.id ? admin : a)) }))

  const refreshAdmins = async () => {
    const result = await call('/admin/admins/')
    if (result.success) patch({ admins: result.admins.map(fromApiAdmin) })
    return result
  }

  const adminPayload = (data) => ({
    fullName: data.fullName.trim(),
    email: data.email.trim().toLowerCase(),
    role: roleCode(data.role),
    ...(data.password ? { password: data.password } : {}),
  })

  const createAdmin = async (data) => {
    if (!isSuperAdmin()) return { success: false, error: 'Only a Super Admin can create admins.' }
    const result = await call('/admin/admins/', { method: 'POST', body: adminPayload(data) }, { audited: true })
    if (result.success) setStore((prev) => ({ ...prev, admins: [...prev.admins, fromApiAdmin(result.admin)] }))
    return result
  }

  const updateAdmin = async (id, data) => {
    if (!isSuperAdmin()) return { success: false, error: 'Only a Super Admin can edit admins.' }
    const body = adminPayload(data)
    // A Super Admin can't change their own role (the server refuses it too)
    if (id === actorRef.current?.id) delete body.role
    const result = await call(`/admin/admins/${id}/`, { method: 'PATCH', body }, { audited: true })
    if (result.success) replaceAdmin(fromApiAdmin(result.admin))
    return result
  }

  const toggleAdminStatus = async (id) => {
    if (!isSuperAdmin() || id === actorRef.current?.id) return { success: false, error: 'You cannot change your own status.' }
    const target = store.admins.find((a) => a.id === id)
    if (!target) return { success: false, error: 'Admin not found.' }
    const status = target.status === 'active' ? 'inactive' : 'active'
    const result = await call(`/admin/admins/${id}/`, { method: 'PATCH', body: { status } }, { audited: true })
    if (result.success) replaceAdmin(fromApiAdmin(result.admin))
    return result
  }

  const deleteAdmin = async (id) => {
    if (!isSuperAdmin() || id === actorRef.current?.id) return { success: false, error: 'You cannot delete your own account.' }
    const result = await call(`/admin/admins/${id}/`, { method: 'DELETE' }, { audited: true })
    if (result.success) setStore((prev) => ({ ...prev, admins: prev.admins.filter((a) => a.id !== id) }))
    return result
  }

  // ---- Customers ----
  // Account fields (identity, status, next of kin, balances) follow the server.
  const EMPTY_BALANCES = { savingsBalance: 0, investmentBalance: 0, outstandingLoan: 0, totalBalance: 0 }

  const mergeCustomer = (local, account) => ({
    ...EMPTY_BALANCES,
    ...local,
    id: account.id,
    fullName: account.fullName,
    email: account.email,
    phone: account.phone,
    agentCode: account.agentCode || null,
    authProvider: account.authProvider,
    joined: account.joined,
    avatarUrl: account.avatarUrl ?? null,
    // The customer's own session doesn't report status changes made by admins
    ...(account.status && { status: account.status }),
    nextOfKin: account.nextOfKin ?? local?.nextOfKin ?? null,
    // Balances change only when a Super Admin approves a payment on the server
    ...(account.savingsBalance !== undefined && {
      savingsBalance: account.savingsBalance,
      investmentBalance: account.investmentBalance,
      outstandingLoan: account.outstandingLoan,
      totalBalance: account.totalBalance,
    }),
  })

  const sameRecord = (a, b) => JSON.stringify(a) === JSON.stringify(b)

  // Mirror the signed-in customer into the store so their portal has a record to read
  const ensureCustomer = (user) => {
    if (!user?.id) return
    setStore((prev) => {
      const existing = prev.customers.find((c) => c.id === user.id)
      const merged = mergeCustomer(existing, { ...user, status: existing?.status || 'active' })
      if (existing && sameRecord(existing, merged)) return prev
      return {
        ...prev,
        customers: existing ? prev.customers.map((c) => (c.id === user.id ? merged : c)) : [...prev.customers, merged],
      }
    })
  }

  // Admin portal: load every customer account
  const refreshCustomers = async () => {
    const result = await call('/admin/customers/')
    if (result.success) {
      setStore((prev) => {
        const local = new Map(prev.customers.map((c) => [c.id, c]))
        return { ...prev, customers: result.customers.map((c) => mergeCustomer(local.get(c.id), c)) }
      })
    }
    return result
  }

  const suspendCustomer = async (id) => {
    const customer = store.customers.find((c) => c.id === id)
    if (!customer) return { success: false, error: 'Customer not found.' }
    const status = customer.status === 'suspended' ? 'active' : 'suspended'
    const result = await call(`/admin/customers/${id}/`, { method: 'PATCH', body: { status } }, { audited: true })
    if (result.success) {
      setStore((prev) => ({
        ...prev,
        customers: prev.customers.map((c) => (c.id === id ? mergeCustomer(c, result.customer) : c)),
      }))
    }
    return result
  }

  // Shows a profile change (e.g. next of kin) at once; the server copy is saved separately
  const updateCustomer = (id, updates) => {
    setStore((prev) => ({
      ...prev,
      customers: prev.customers.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }))
  }

  // ---- Collection bank accounts ----
  // Every admin can see them; only a Super Admin can change where customers pay.
  const applyBankAccounts = (result) => {
    if (result.success) patch({ bankAccounts: result.accounts, accountAssignments: result.assignments })
    return result
  }

  const bankPayload = (data) => ({
    bankName: data.bankName.trim(),
    accountName: data.accountName.trim(),
    accountNumber: data.accountNumber.trim(),
    notes: data.notes?.trim() || '',
  })

  const refreshBankAccounts = async () => applyBankAccounts(await call('/admin/bank-accounts/'))

  const addBankAccount = async (data) =>
    applyBankAccounts(await call('/admin/bank-accounts/', { method: 'POST', body: bankPayload(data) }, { audited: true }))

  const updateBankAccount = async (id, data) =>
    applyBankAccounts(await call(`/admin/bank-accounts/${id}/`, { method: 'PATCH', body: bankPayload(data) }, { audited: true }))

  const toggleBankAccountStatus = async (id) => {
    const account = store.bankAccounts.find((a) => a.id === id)
    if (!account) return { success: false, error: 'Bank account not found.' }
    const status = account.status === 'active' ? 'inactive' : 'active'
    return applyBankAccounts(await call(`/admin/bank-accounts/${id}/`, { method: 'PATCH', body: { status } }, { audited: true }))
  }

  // Its facility mappings go too, so those facilities fall back to the default account
  const removeBankAccount = async (id) =>
    applyBankAccounts(await call(`/admin/bank-accounts/${id}/`, { method: 'DELETE' }, { audited: true }))

  // accountId '' clears the mapping (the facility then uses the default account)
  const assignBankAccount = async (facility, accountId, facilityName) =>
    applyBankAccounts(await call(`/admin/bank-accounts/assignments/${facility}/`, {
      method: 'PUT',
      body: { accountId: accountId || '', facilityName },
    }, { audited: true }))

  // ---- Notifications (the signed-in customer's or admin's own, created by the server) ----
  const refreshNotifications = async () => {
    const result = await call('/notifications/')
    if (result.success) patch({ notifications: result.notifications, unreadCount: result.unreadCount })
    return result
  }

  // Marked read here straight away; the server is told in the background
  const markNotificationRead = (id) => {
    setStore((prev) => {
      const target = prev.notifications.find((n) => n.id === id)
      if (!target || target.read) return prev
      return {
        ...prev,
        unreadCount: Math.max(0, prev.unreadCount - 1),
        notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      }
    })
    api(`/notifications/${id}/read/`, { method: 'POST' }).catch(() => {})
  }

  const markAllNotificationsRead = () => {
    setStore((prev) => ({ ...prev, unreadCount: 0, notifications: prev.notifications.map((n) => ({ ...n, read: true })) }))
    api('/notifications/read-all/', { method: 'POST' }).catch(() => {})
  }

  const value = {
    ...store,
    setActor,
    refreshAuditLogs,
    refreshProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    refreshTransactions,
    createTransaction,
    attachReceipt,
    recordSlipView,
    recommendPayment,
    approvePayment,
    rejectPayment,
    refreshWithdrawals,
    getWithdrawablePlans,
    quoteWithdrawal,
    requestWithdrawal,
    cancelWithdrawal,
    getAdminWithdrawal,
    withdrawalAction,
    refreshAgents,
    createAgent,
    updateAgent,
    toggleAgentStatus,
    refreshAdmins,
    createAdmin,
    updateAdmin,
    toggleAdminStatus,
    deleteAdmin,
    ensureCustomer,
    refreshCustomers,
    suspendCustomer,
    updateCustomer,
    refreshBankAccounts,
    addBankAccount,
    updateBankAccount,
    toggleBankAccountStatus,
    removeBankAccount,
    assignBankAccount,
    refreshNotifications,
    markNotificationRead,
    markAllNotificationsRead,
  }

  return <DataStoreContext.Provider value={value}>{children}</DataStoreContext.Provider>
}

export function useDataStore() {
  const ctx = useContext(DataStoreContext)
  if (!ctx) throw new Error('useDataStore must be used within DataStoreProvider')
  return ctx
}
