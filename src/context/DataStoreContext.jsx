import { createContext, useContext, useEffect, useState } from 'react'
import { initialCustomers } from '../data/customers'
import { initialProducts } from '../data/products'
import { initialTransactions } from '../data/transactions'
import { initialNotifications } from '../data/notifications'
import { initialAuditLogs } from '../data/auditLogs'
import { initialBankDetails } from '../data/bankDetails'

const DataStoreContext = createContext(null)
const STORAGE_KEY = 'empire_data_store_v1'

function loadSeed() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore corrupted storage, fall through to defaults
  }
  return {
    customers: initialCustomers,
    products: initialProducts,
    transactions: initialTransactions,
    notifications: initialNotifications,
    auditLogs: initialAuditLogs,
    bankDetails: initialBankDetails,
  }
}

export function DataStoreProvider({ children }) {
  const [store, setStore] = useState(loadSeed)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  }, [store])

  const addAuditLog = (entry) => {
    setStore((prev) => ({
      ...prev,
      auditLogs: [
        {
          id: `a${Date.now()}`,
          date: new Date().toISOString(),
          user: 'Admin (Sarah Johnson)',
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

  const approvePayment = (transactionId) => {
    const txn = store.transactions.find((t) => t.id === transactionId)
    setStore((prev) => ({
      ...prev,
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
    if (txn) {
      addAuditLog({
        action: 'Payment Approved',
        reference: txn.reference,
        status: 'success',
        details: `Approved ${txn.productName} payment of ₦${txn.amount.toLocaleString()} for ${txn.customerName}.`,
      })
      addNotification({
        title: 'Payment Approved',
        message: `Your ${txn.productName} payment of ₦${txn.amount.toLocaleString()} (${txn.reference}) has been approved.`,
        type: 'success',
      })
    }
  }

  const rejectPayment = (transactionId, reason) => {
    const txn = store.transactions.find((t) => t.id === transactionId)
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
    if (txn) {
      addAuditLog({
        action: 'Payment Rejected',
        reference: txn.reference,
        status: 'error',
        details: `Rejected ${txn.productName} payment of ₦${txn.amount.toLocaleString()} for ${txn.customerName}. Reason: ${reason || 'Not specified.'}`,
      })
      addNotification({
        title: 'Payment Rejected',
        message: `Your ${txn.productName} payment (${txn.reference}) was rejected. Reason: ${reason || 'Not specified.'}`,
        type: 'error',
      })
    }
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
        status: nextStatus === 'suspended' ? 'error' : 'info',
        details: `${customer.fullName}'s account status changed to ${nextStatus}.`,
      })
    }
  }

  // ---- Bank Details ----
  const updateBankDetails = (updates) => {
    setStore((prev) => ({ ...prev, bankDetails: { ...prev.bankDetails, ...updates } }))
    addAuditLog({
      action: 'Bank Details Updated',
      reference: 'Payment Settings',
      status: 'info',
      details: 'Default settlement bank details were updated.',
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
    approvePayment,
    rejectPayment,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    suspendCustomer,
    updateBankDetails,
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
