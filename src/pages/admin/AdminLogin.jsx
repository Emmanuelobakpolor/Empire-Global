import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Info, ShieldCheck } from 'lucide-react'
import Logo from '../../components/Logo'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useAdminAuth, DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '../../context/AdminAuthContext'
import { useToast } from '../../context/ToastContext'

export default function AdminLogin() {
  const [email, setEmail] = useState(DEMO_ADMIN_EMAIL)
  const [password, setPassword] = useState(DEMO_ADMIN_PASSWORD)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAdminAuth()
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
      showToast('Welcome back, Admin.', 'success')
      navigate('/admin/dashboard')
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(16,185,129,0.25), transparent 40%), radial-gradient(circle at 80% 80%, rgba(16,185,129,0.15), transparent 35%)'
      }} />
      <div className="relative w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo variant="light" />
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="flex items-center gap-2 justify-center mb-1">
            <ShieldCheck size={18} className="text-emerald-500" />
            <h1 className="text-xl font-bold text-navy-900">Admin Portal</h1>
          </div>
          <p className="text-sm text-navy-400 text-center mb-6">Sign in to manage Empire Global operations.</p>

          <div className="flex items-start gap-2 bg-emerald-50 text-emerald-700 text-xs rounded-xl px-3.5 py-2.5 mb-6">
            <Info size={15} className="mt-0.5 shrink-0" />
            <p>Demo login: <strong>{DEMO_ADMIN_EMAIL}</strong> / <strong>{DEMO_ADMIN_PASSWORD}</strong></p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Admin Email"
              type="email"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-xs text-red-500 -mt-1">{error}</p>}
            <Button type="submit" fullWidth loading={loading} size="lg">
              Login to Admin Console
            </Button>
          </form>
        </div>
        <p className="text-center text-xs text-navy-500 mt-6">© {new Date().getFullYear()} Empire Global. Admin access only.</p>
      </div>
    </div>
  )
}
