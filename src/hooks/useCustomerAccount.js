import { useAuth } from '../context/AuthContext'
import { useDataStore } from '../context/DataStoreContext'

/**
 * The logged-in customer's account, preferring the shared store's record
 * (which admin approvals update) over the session snapshot from login.
 */
export function useCustomerAccount() {
  const { user } = useAuth()
  const { customers } = useDataStore()
  const record = customers.find((c) => c.id === user?.id)
  return record ? { ...user, ...record } : user
}
