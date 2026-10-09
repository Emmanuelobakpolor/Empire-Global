import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import AuthLayout from '../../components/AuthLayout'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import GoogleAuthButton, { AuthDivider } from '../../components/GoogleAuthButton'
import { useAuth } from '../../context/AuthContext'
import { useGoogleAvailable } from '../../utils/googleAuth'
import { useToast } from '../../context/ToastContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const googleAvailable = useGoogleAvailable()
  const { login, continueWithGoogle } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    if (result.success) {
      showToast('Welcome back! You have logged in successfully.', 'success')
      navigate('/customer/dashboard')
    } else if (result.needsVerification) {
      showToast(result.error, 'info')
      navigate('/verify-email')
    } else {
      setError(result.error)
    }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    const result = await continueWithGoogle()
    setGoogleLoading(false)
    if (result.cancelled) return
    if (!result.success) {
      showToast(result.error, 'error')
      return
    }
    if (result.isNewUser) {
      navigate('/complete-profile', { state: { googleProfile: result.googleProfile } })
    } else {
      showToast('Welcome back! You have logged in with Google.', 'success')
      navigate('/customer/dashboard')
    }
  }

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Log in to manage your savings, investments and more."
      footer={
        <>
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-700">
            Create Account
          </Link>
        </>
      }
    >
      {googleAvailable !== false && (
        <>
          <GoogleAuthButton onClick={handleGoogle} loading={googleLoading} disabled={googleAvailable === null} />
          <AuthDivider>or login with email</AuthDivider>
        </>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email Address"
          type="email"
          icon={Mail}
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          icon={Lock}
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-xs text-red-500 -mt-1">{error}</p>}
        <div className="flex justify-end -mt-1">
          <Link to="/forgot-password" className="text-xs font-semibold text-navy-500 hover:text-emerald-600">
            Forgot Password?
          </Link>
        </div>
        <Button type="submit" fullWidth loading={loading} size="lg">
          Login
        </Button>
      </form>
    </AuthLayout>
  )
}
