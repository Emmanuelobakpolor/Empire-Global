import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { initialCustomers } from '../data/customers'
import { initialProducts } from '../data/products'
import { initialTransactions } from '../data/transactions'
import { initialNotifications } from '../data/notifications'
import { initialAuditLogs } from '../data/auditLogs'
import { initialBankAccounts, initialAccountAssignments } from '../data/bankAccounts'
import { initialAdmins, ROLES } from '../data/admins'
import { initialAgents, findAgent, nextAgentCode } from '../data/agents'

const DataStoreContext = createContext(null)
// v2 adds admins, customer agent codes and payment slip review trails
const STORAGE_KEY = 'empire_data_store_v2'

// A repeat view by the same admin within this window isn't logged again
const VIEW_DEDUPE_MS = 10 * 60 * 1000

// Which customer balance an approved payment of each product type credits.
// Hire-purchase pays for goods, so it doesn't move a balance.
const BALANCE_KEY_BY_TYPE = {
  savings: 'savingsBalance',
  thrift: 'savingsBalance',
  investment: 'investmentBalance',
  loan: 'outstandingLoan',
}

function applyApprovedAmount(customer, txn) {
  const key = BALANCE_KEY_BY_TYPE[txn.productType]
  if (!key) return customer
  const next = { ...customer, [key]: (customer[key] || 0) + txn.amount }
  return { ...next, totalBalance: (next.savingsBalance || 0) + (next.investmentBalance || 0) }
}

function loadSeed() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      // Fill in collections added after this browser's data was saved
      const saved = { ...defaultStore(), ...JSON.parse(raw) }
      // Products saved before the official catalogue (no `category`) are replaced by it
      if (!saved.products.some((p) => p.category)) saved.products = initialProducts
      // Plan lengths were added later; copy them onto saved products that lack them
      saved.products = saved.products.map((p) =>
        'termOptions' in p ? p : { ...p, termOptions: initialProducts.find((s) => s.id === p.id)?.termOptions ?? null }
      )
      return saved
    }
  } catch {
    // ignore corrupted storage, fall through to defaults
  }
  return defaultStore()
}

function defaultStore() {
  return {
    customers: initialCustomers,
    products: initialProducts,
    transactions: initialTransactions,
    notifications: initialNotifications,
    auditLogs: initialAuditLogs,
    bankAccounts: initialBankAccounts,
    accountAssignments: initialAccountAssignments,
    admins: initialAdmins,
    agents: initialAgents,
  }
}

export function DataStoreProvider({ children }) {
  const [store, setStore] = useState(loadSeed)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  }, [store])

  // The signed-in admin, set by AdminAuthProvider. Used to attribute audit entries
  // and to enforce role permissions on admin-only actions.
  const actorRef = useRef(null)
  const setActor = (admin) => {
    actorRef.current = admin
  }
  const isSuperAdmin = () => actorRef.current?.role === ROLES.SUPER_ADMIN

  const agentCodeFor = (customerId) => store.customers.find((c) => c.id === customerId)?.agentCode || null

  const addAuditLog = (entry) => {
    const actor = actorRef.current
    setStore((prev) => ({
      ...prev,
      auditLogs: [
        {
          id: `a${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
          date: new Date().toISOString(),
          user: actor?.fullName || 'System',
          role: actor?.role || null,
          status: 'info',
          ...entry,
        },
        ...prev.auditLogs,
      ],
    }))
  }

  const addNotification = (entry) => {
    setStore((prev) => ({
      ...prev,
      notifications: [
        { id: `n${Date.now()}`, date: new Date().toISOString(), read: false, ...entry },
        ...prev.notifications,
      ],
    }))
  }

  // ---- Transactions ----
  const createTransaction = (txn) => {
    setStore((prev) => ({ ...prev, transactions: [txn, ...prev.transactions] }))
  }

  const attachReceipt = (transactionId, receipt) => {
    setStore((prev) => ({
      ...prev,
      transactions: prev.transactions.map((t) =>
        t.id === transactionId
          ? {
              ...t,
              receipt,
              status: 'pending',
              timeline: t.timeline.map((step) =>
                step.label === 'Receipt Uploaded'
                  ? { ...step, done: true, date: new Date().toISOString() }
                  : step.label === 'Awaiting Verification'
                  ? { ...step, current: true }
                  : step
              ),
            }
          : t
      ),
    }))
  }

  // ---- Payment slip review ----
  // Admins view and recommend; only a Super Admin's final decision credits or rejects.
  // Every step is appended to the transaction's slipTrail and to the audit log.
  const appendTrail = (transactionId, step) => {
    const actor = actorRef.current
    const entry = { by: actor?.fullName || 'System', role: actor?.role || null, at: new Date().toISOString(), ...step }
    setStore((prev) => ({
      ...prev,
      transactions: prev.transactions.map((t) =>
        t.id === transactionId ? { ...t, slipTrail: [...(t.slipTrail || []), entry] } : t
      ),
    }))
  }

  // Also checked in memory, because the store state read here can be one render stale
  const recentViewsRef = useRef({})
  const recordSlipView = (transactionId) => {
    const actor = actorRef.current
    const txn = store.transactions.find((t) => t.id === transactionId)
    if (!actor || !txn) return
    const key = `${transactionId}:${actor.id}`
    const recentlyViewed =
      Date.now() - (recentViewsRef.current[key] || 0) < VIEW_DEDUPE_MS ||
      (txn.slipTrail || []).some(
        (s) => s.action === 'viewed' && s.by === actor.fullName && Date.now() - new Date(s.at).getTime() < VIEW_DEDUPE_MS
      )
    if (recentlyViewed) return
    recentViewsRef.current[key] = Date.now()
    appendTrail(transactionId, { action: 'viewed' })
    addAuditLog({
      action: 'Payment Slip Viewed',
      reference: txn.reference,
      agentCode: agentCodeFor(txn.customerId),
      status: 'info',
      details: `Viewed ${txn.productName} payment slip of ₦${txn.amount.toLocaleString()} for ${txn.customerName}.`,
    })
  }

  // decision: 'approve' | 'reject'
  const recommendPayment = (transactionId, decision, note) => {
    const txn = store.transactions.find((t) => t.id === transactionId)
    if (!txn || txn.status === 'approved' || txn.status === 'rejected') return
    const approve = decision === 'approve'
    appendTrail(transactionId, { action: approve ? 'recommended_approval' : 'recommended_rejection', note: note || undefined })
    addAuditLog({
      action: approve ? 'Payment Recommended for Approval' : 'Payment Recommended for Rejection',
      reference: txn.reference,
      agentCode: agentCodeFor(txn.customerId),
      status: approve ? 'info' : 'warning',
      details: `Recommended ${approve ? 'approval' : 'rejection'} of ${txn.productName} payment of ₦${txn.amount.toLocaleString()} for ${txn.customerName}. Awaiting Super Admin final approval.${note ? ` Note: ${note}` : ''}`,
    })
  }

  const approvePayment = (transactionId, note) => {
    if (!isSuperAdmin()) return
    const txn = store.transactions.find((t) => t.id === transactionId)
    if (!txn || txn.status === 'approved') return
    setStore((prev) => ({
      ...prev,
      customers: prev.customers.map((c) => (c.id === txn.customerId ? applyApprovedAmount(c, txn) : c)),
      transactions: prev.transactions.map((t) =>
        t.id === transactionId
          ? {
              ...t,
              status: 'approved',
              timeline: t.timeline.map((step) =>
                step.label === 'Awaiting Verification'
                  ? { ...step, done: true, current: false }
                  : step.label === 'Payment Approved'
                  ? { ...step, done: true, date: new Date().toISOString() }
                  : step
              ),
            }
          : t
      ),
    }))
    appendTrail(transactionId, { action: 'approved', note: note || undefined })
    addAuditLog({
      action: 'Payment Approved',
      reference: txn.reference,
      agentCode: agentCodeFor(txn.customerId),
      status: 'success',
      details: `Final approval of ${txn.productName} payment of ₦${txn.amount.toLocaleString()} for ${txn.customerName}. Customer credited.`,
    })
    addNotification({
      title: 'Payment Approved',
      message: `Your ${txn.productName} payment of ₦${txn.amount.toLocaleString()} (${txn.reference}) has been approved.`,
      type: 'success',
    })
  }

  const rejectPayment = (transactionId, reason) => {
    if (!isSuperAdmin()) return
    const txn = store.transactions.find((t) => t.id === transactionId)
    if (!txn || txn.status === 'rejected') return
    setStore((prev) => ({
      ...prev,
      transactions: prev.transactions.map((t) =>
        t.id === transactionId
          ? {
              ...t,
              status: 'rejected',
              rejectionReason: reason || 'Payment could not be verified.',
              timeline: t.timeline.map((step) =>
                step.label === 'Awaiting Verification'
                  ? { ...step, done: true, current: false }
                  : step
              ).concat(
                t.timeline.some((s) => s.label === 'Payment Rejected')
                  ? []
                  : [{ label: 'Payment Rejected', done: true, rejected: true, date: new Date().toISOString() }]
              ),
            }
          : t
      ),
    }))
    appendTrail(transactionId, { action: 'rejected', note: reason || undefined })
    addAuditLog({
      action: 'Payment Rejected',
      reference: txn.reference,
      agentCode: agentCodeFor(txn.customerId),
      status: 'error',
      details: `Final rejection of ${txn.productName} payment of ₦${txn.amount.toLocaleString()} for ${txn.customerName}. Reason: ${reason || 'Not specified.'}`,
    })
    addNotification({
      title: 'Payment Rejected',
      message: `Your ${txn.productName} payment (${txn.reference}) was rejected. Reason: ${reason || 'Not specified.'}`,
      type: 'error',
    })
  }

  // ---- Agents (Admin and Super Admin) ----
  // Agents are deactivated rather than deleted, so customers and history linked
  // to their code keep pointing at a real record.
  const createAgent = (data) => {
    if (!actorRef.current) return { success: false, error: 'You must be signed in as an admin.' }
    const agent = {
      code: nextAgentCode(store.agents),
      name: data.name.trim(),
      phone: data.phone.trim(),
      location: data.location.trim(),
      status: 'active',
      createdAt: new Date().toISOString().slice(0, 10),
    }
    setStore((prev) => ({ ...prev, agents: [...prev.agents, agent] }))
    addAuditLog({
      action: 'Agent Created',
      reference: agent.code,
      agentCode: agent.code,
      status: 'success',
      details: `Created agent ${agent.name} (${agent.code}) in ${agent.location}.`,
    })
    return { success: true, agent }
  }

  const updateAgent = (code, data) => {
    if (!actorRef.current) return { success: false, error: 'You must be signed in as an admin.' }
    const updates = { name: data.name.trim(), phone: data.phone.trim(), location: data.location.trim() }
    setStore((prev) => ({ ...prev, agents: prev.agents.map((a) => (a.code === code ? { ...a, ...updates } : a)) }))
    addAuditLog({
      action: 'Agent Updated',
      reference: code,
      agentCode: code,
      status: 'info',
      details: `Updated agent ${updates.name} (${code}).`,
    })
    return { success: true }
  }

  const toggleAgentStatus = (code) => {
    if (!actorRef.current) return
    const agent = findAgent(store.agents, code)
    if (!agent) return
    const nextStatus = agent.status === 'active' ? 'inactive' : 'active'
    setStore((prev) => ({ ...prev, agents: prev.agents.map((a) => (a.code === code ? { ...a, status: nextStatus } : a)) }))
    addAuditLog({
      action: nextStatus === 'active' ? 'Agent Activated' : 'Agent Deactivated',
      reference: code,
      agentCode: code,
      status: nextStatus === 'active' ? 'info' : 'error',
      details: `Agent ${agent.name} (${code}) was ${nextStatus === 'active' ? 'activated' : 'deactivated'}.`,
    })
  }

  // ---- Admin accounts (Super Admin only) ----
  const createAdmin = (data) => {
    if (!isSuperAdmin()) return { success: false, error: 'Only a Super Admin can create admins.' }
    const email = data.email.trim().toLowerCase()
    if (store.admins.some((a) => a.email.toLowerCase() === email)) {
      return { success: false, error: 'An admin with this email already exists.' }
    }
    const newAdmin = {
      id: `ADM-${String(Date.now()).slice(-5)}`,
      fullName: data.fullName.trim(),
      email,
      password: data.password,
      role: data.role,
      status: 'active',
      createdAt: new Date().toISOString().slice(0, 10),
    }
    setStore((prev) => ({ ...prev, admins: [...prev.admins, newAdmin] }))
    addAuditLog({
      action: 'Admin Created',
      reference: newAdmin.id,
      status: 'success',
      details: `Created ${newAdmin.role} account for ${newAdmin.fullName} (${newAdmin.email}).`,
    })
    return { success: true }
  }

  const updateAdmin = (id, data) => {
    if (!isSuperAdmin()) return { success: false, error: 'Only a Super Admin can edit admins.' }
    const email = data.email.trim().toLowerCase()
    if (store.admins.some((a) => a.id !== id && a.email.toLowerCase() === email)) {
      return { success: false, error: 'An admin with this email already exists.' }
    }
    const target = store.admins.find((a) => a.id === id)
    // A Super Admin can't demote themselves and lock everyone out of admin management
    const role = id === actorRef.current?.id ? target.role : data.role
    const updates = { fullName: data.fullName.trim(), email, role, ...(data.password ? { password: data.password } : {}) }
    setStore((prev) => ({ ...prev, admins: prev.admins.map((a) => (a.id === id ? { ...a, ...updates } : a)) }))
    addAuditLog({
      action: 'Admin Updated',
      reference: id,
      status: 'info',
      details: `Updated ${updates.fullName}'s account${target.role !== role ? ` (role changed from ${target.role} to ${role})` : ''}.`,
    })
    return { success: true }
  }

  const toggleAdminStatus = (id) => {
    if (!isSuperAdmin() || id === actorRef.current?.id) return
    const target = store.admins.find((a) => a.id === id)
    if (!target) return
    const nextStatus = target.status === 'active' ? 'inactive' : 'active'
    setStore((prev) => ({ ...prev, admins: prev.admins.map((a) => (a.id === id ? { ...a, status: nextStatus } : a)) }))
    addAuditLog({
      action: nextStatus === 'active' ? 'Admin Activated' : 'Admin Deactivated',
      reference: id,
      status: nextStatus === 'active' ? 'info' : 'error',
      details: `${target.fullName}'s admin account was ${nextStatus === 'active' ? 'activated' : 'deactivated'}.`,
    })
  }

  const deleteAdmin = (id) => {
    if (!isSuperAdmin() || id === actorRef.current?.id) return
    const target = store.admins.find((a) => a.id === id)
    if (!target) return
    setStore((prev) => ({ ...prev, admins: prev.admins.filter((a) => a.id !== id) }))
    addAuditLog({
      action: 'Admin Deleted',
      reference: id,
      status: 'error',
      details: `Deleted ${target.role} account for ${target.fullName} (${target.email}).`,
    })
  }

  // ---- Products ----
  const addProduct = (product) => {
    const newProduct = { ...product, id: `p${Date.now()}` }
    setStore((prev) => ({ ...prev, products: [newProduct, ...prev.products] }))
    addAuditLog({
      action: 'Product Created',
      reference: product.name,
      status: 'info',
      details: `New ${product.type} product "${product.name}" added.`,
    })
    return newProduct
  }

  const updateProduct = (id, updates) => {
    setStore((prev) => ({
      ...prev,
      products: prev.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }))
    addAuditLog({
      action: 'Product Updated',
      reference: updates.name || id,
      status: 'info',
      details: `Product "${updates.name || id}" was updated.`,
    })
  }

  const deleteProduct = (id) => {
    setStore((prev) => ({ ...prev, products: prev.products.filter((p) => p.id !== id) }))
  }

  const toggleProductStatus = (id) => {
    setStore((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === id ? { ...p, status: p.status === 'active' ? 'disabled' : 'active' } : p
      ),
    }))
  }

  // ---- Customers ----
  // Newly registered customers only exist in the auth session; add them to the
  // store so admins can see them and approvals have a record to credit.
  const ensureCustomer = (user) => {
    if (!user?.id) return
    setStore((prev) =>
      prev.customers.some((c) => c.id === user.id)
        ? prev
        : { ...prev, customers: [...prev.customers, user] }
    )
  }

  const suspendCustomer = (id) => {
    const customer = store.customers.find((c) => c.id === id)
    const nextStatus = customer?.status === 'suspended' ? 'active' : 'suspended'
    setStore((prev) => ({
      ...prev,
      customers: prev.customers.map((c) => (c.id === id ? { ...c, status: nextStatus } : c)),
    }))
    if (customer) {
      addAuditLog({
        action: nextStatus === 'suspended' ? 'Customer Suspended' : 'Customer Reactivated',
        reference: id,
        agentCode: customer.agentCode || null,
        status: nextStatus === 'suspended' ? 'error' : 'info',
        details: `${customer.fullName}'s account status changed to ${nextStatus}.`,
      })
    }
  }

  // Profile details (e.g. next of kin) saved from the customer portal
  const updateCustomer = (id, updates) => {
    setStore((prev) => ({
      ...prev,
      customers: prev.customers.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }))
  }

  // ---- Bank accounts per facility (Admin and Super Admin) ----
  const describeAccount = (a) => `${a.bankName} · ${a.accountNumber} (${a.accountName})`

  const addBankAccount = (data) => {
    if (!actorRef.current) return null
    const account = {
      id: `ba${Date.now()}`,
      bankName: data.bankName.trim(),
      accountName: data.accountName.trim(),
      accountNumber: data.accountNumber.trim(),
      notes: data.notes?.trim() || '',
      status: 'active',
      createdAt: new Date().toISOString().slice(0, 10),
    }
    setStore((prev) => ({ ...prev, bankAccounts: [...prev.bankAccounts, account] }))
    addAuditLog({
      action: 'Bank Account Added',
      reference: account.accountNumber,
      status: 'success',
      details: `Added collection account ${describeAccount(account)}.`,
    })
    return account
  }

  const updateBankAccount = (id, data) => {
    if (!actorRef.current) return
    const before = store.bankAccounts.find((a) => a.id === id)
    if (!before) return
    const updates = {
      bankName: data.bankName.trim(),
      accountName: data.accountName.trim(),
      accountNumber: data.accountNumber.trim(),
      notes: data.notes?.trim() || '',
    }
    setStore((prev) => ({ ...prev, bankAccounts: prev.bankAccounts.map((a) => (a.id === id ? { ...a, ...updates } : a)) }))
    addAuditLog({
      action: 'Bank Account Updated',
      reference: updates.accountNumber,
      status: 'info',
      details: `Changed ${describeAccount(before)} to ${describeAccount({ ...before, ...updates })}.`,
    })
  }

  const toggleBankAccountStatus = (id) => {
    if (!actorRef.current) return
    const account = store.bankAccounts.find((a) => a.id === id)
    if (!account) return
    const nextStatus = account.status === 'active' ? 'inactive' : 'active'
    setStore((prev) => ({ ...prev, bankAccounts: prev.bankAccounts.map((a) => (a.id === id ? { ...a, status: nextStatus } : a)) }))
    addAuditLog({
      action: nextStatus === 'active' ? 'Bank Account Activated' : 'Bank Account Deactivated',
      reference: account.accountNumber,
      status: nextStatus === 'active' ? 'info' : 'error',
      details: `${describeAccount(account)} was ${nextStatus === 'active' ? 'activated' : 'deactivated'}.`,
    })
  }

  // Removing an account also clears its facility mappings, so those facilities fall back to the default
  const removeBankAccount = (id) => {
    if (!actorRef.current) return
    const account = store.bankAccounts.find((a) => a.id === id)
    if (!account) return
    setStore((prev) => ({
      ...prev,
      bankAccounts: prev.bankAccounts.filter((a) => a.id !== id),
      accountAssignments: Object.fromEntries(Object.entries(prev.accountAssignments).filter(([, accId]) => accId !== id)),
    }))
    addAuditLog({
      action: 'Bank Account Removed',
      reference: account.accountNumber,
      status: 'error',
      details: `Removed collection account ${describeAccount(account)}.`,
    })
  }

  // accountId '' clears the mapping (the facility then uses the default account)
  const assignBankAccount = (facility, accountId, facilityName) => {
    if (!actorRef.current) return
    const account = store.bankAccounts.find((a) => a.id === accountId)
    setStore((prev) => {
      const next = { ...prev.accountAssignments }
      if (accountId) next[facility] = accountId
      else delete next[facility]
      return { ...prev, accountAssignments: next }
    })
    addAuditLog({
      action: 'Bank Account Assigned',
      reference: facilityName,
      status: 'info',
      details: account
        ? `${facilityName} payments now go to ${describeAccount(account)}.`
        : `${facilityName} now uses the default collection account.`,
    })
  }

  // ---- Notifications ----
  const markNotificationRead = (id) => {
    setStore((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }))
  }

  const markAllNotificationsRead = () => {
    setStore((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }))
  }

  const value = {
    ...store,
    createTransaction,
    attachReceipt,
    recordSlipView,
    recommendPayment,
    approvePayment,
    rejectPayment,
    createAgent,
    updateAgent,
    toggleAgentStatus,
    createAdmin,
    updateAdmin,
    toggleAdminStatus,
    deleteAdmin,
    setActor,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    ensureCustomer,
    suspendCustomer,
    updateCustomer,
    addBankAccount,
    updateBankAccount,
    toggleBankAccountStatus,
    removeBankAccount,
    assignBankAccount,
    markNotificationRead,
    markAllNotificationsRead,
    addAuditLog,
    addNotification,
  }

  return <DataStoreContext.Provider value={value}>{children}</DataStoreContext.Provider>
}

export function useDataStore() {
  const ctx = useContext(DataStoreContext)
  if (!ctx) throw new Error('useDataStore must be used within DataStoreProvider')
  return ctx
}
