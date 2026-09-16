import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingState from '../components/ui/LoadingState'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <LoadingState label="Loading your account..." />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}
