import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Info } from 'lucide-react'
import AuthLayout from '../../components/AuthLayout'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export default function Login() {
  const [email, setEmail] = useState('customer@example.com')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
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
    } else {
      setError(result.error)
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
      <div className="flex items-start gap-2 bg-emerald-50 text-emerald-700 text-xs rounded-xl px-3.5 py-2.5 mb-6">
        <Info size={15} className="mt-0.5 shrink-0" />
        <p>Demo login: <strong>customer@example.com</strong> / <strong>password123</strong></p>
      </div>

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
