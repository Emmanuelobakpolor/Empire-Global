import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import Button from '../components/ui/Button'
import Logo from '../components/Logo'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 text-center">
      <Logo />
      <h1 className="text-6xl font-extrabold text-navy-900 mt-8">404</h1>
      <p className="text-navy-400 mt-2 mb-8">The page you're looking for doesn't exist.</p>
      <Link to="/">
        <Button icon={Home}>Back to Home</Button>
      </Link>
    </div>
  )
}
