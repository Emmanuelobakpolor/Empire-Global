import { Navigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'
import LoadingState from '../components/ui/LoadingState'

export default function AdminProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAdminAuth()

  if (loading) return <LoadingState label="Loading admin console..." />
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  return children
}
