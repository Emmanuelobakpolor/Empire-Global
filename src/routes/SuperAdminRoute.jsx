import { Navigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'

// Wraps pages only a Super Admin may open; regular admins are sent to the dashboard.
export default function SuperAdminRoute({ children }) {
  const { isSuperAdmin } = useAdminAuth()
  if (!isSuperAdmin) return <Navigate to="/admin/dashboard" replace />
  return children
}
