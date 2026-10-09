import { Navigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'
import LoadingState from '../components/ui/LoadingState'

export default function AdminProtectedRoute({ children }) {
  const { admin, isAuthenticated, loading } = useAdminAuth()

  if (loading) return <LoadingState label="Loading admin console..." />
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  // A temporary password set by a Super Admin must be replaced first (the API enforces this too)
  if (admin.mustChangePassword) return <Navigate to="/admin/set-password" replace />
  return children
}
