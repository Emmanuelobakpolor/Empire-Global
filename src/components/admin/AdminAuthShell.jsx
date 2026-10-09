import { ShieldCheck } from 'lucide-react'
import Logo from '../Logo'

// Dark full-screen frame shared by the admin sign-in screens
export default function AdminAuthShell({ title, subtitle, icon: Icon = ShieldCheck, children }) {
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
            <Icon size={18} className="text-emerald-500" />
            <h1 className="text-xl font-bold text-navy-900">{title}</h1>
          </div>
          {subtitle && <p className="text-sm text-navy-400 text-center mb-6">{subtitle}</p>}
          {children}
        </div>
        <p className="text-center text-xs text-navy-500 mt-6">© {new Date().getFullYear()} Empire Global. Admin access only.</p>
      </div>
    </div>
  )
}
