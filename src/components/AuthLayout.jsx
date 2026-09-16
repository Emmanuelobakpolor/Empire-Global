import { Link } from 'react-router-dom'
import { ShieldCheck, TrendingUp, Eye } from 'lucide-react'
import Logo from './Logo'

const POINTS = [
  { icon: ShieldCheck, text: 'Bank-grade security on every transaction' },
  { icon: Eye, text: 'Full transparency on payments and approvals' },
  { icon: TrendingUp, text: 'Grow your savings and investments with ease' },
]

export default function AuthLayout({ children, title, subtitle, footer }) {
  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="hidden lg:flex w-[42%] bg-navy-900 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(16,185,129,0.25), transparent 40%), radial-gradient(circle at 80% 80%, rgba(16,185,129,0.15), transparent 35%)'
        }} />
        <div className="relative">
          <Link to="/"><Logo variant="light" /></Link>
        </div>
        <div className="relative">
          <h2 className="text-3xl font-bold text-white leading-tight">Build Your Financial Future</h2>
          <p className="text-navy-300 mt-3 max-w-sm">
            Manage savings, investments, loans and hire-purchase — all in one secure platform.
          </p>
          <div className="flex flex-col gap-4 mt-8">
            {POINTS.map((p) => (
              <div key={p.text} className="flex items-center gap-3 text-navy-200 text-sm">
                <span className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <p.icon size={17} className="text-emerald-400" />
                </span>
                {p.text}
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-navy-500">© {new Date().getFullYear()} Empire Global. All rights reserved.</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex justify-center">
            <Link to="/"><Logo /></Link>
          </div>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-navy-900">{title}</h1>
            {subtitle && <p className="text-sm text-navy-400 mt-2">{subtitle}</p>}
          </div>
          <div className="bg-white rounded-2xl border border-navy-100 shadow-card p-6 sm:p-8">{children}</div>
          {footer && <div className="text-center mt-6 text-sm text-navy-500">{footer}</div>}
        </div>
      </div>
    </div>
  )
}
