import { createContext, useContext, useEffect, useState } from 'react'
import { demoCustomer } from '../data/customers'
import { generateCustomerId } from '../utils/generateReference'

const AuthContext = createContext(null)
const STORAGE_KEY = 'empire_customer_session'

export const DEMO_CUSTOMER_EMAIL = 'customer@example.com'
export const DEMO_CUSTOMER_PASSWORD = 'password123'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setUser(JSON.parse(raw))
    } catch {
      // ignore corrupted storage
    }
    setLoading(false)
  }, [])

  const persist = (nextUser) => {
    setUser(nextUser)
    if (nextUser) localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
    else localStorage.removeItem(STORAGE_KEY)
  }

  const login = async (email, password) => {
    await new Promise((r) => setTimeout(r, 600))
    if (email?.trim().toLowerCase() === DEMO_CUSTOMER_EMAIL && password === DEMO_CUSTOMER_PASSWORD) {
      persist(demoCustomer)
      return { success: true }
    }
    if (email && password) {
      // Any other credentials still succeed as a generic mock customer, per "simulate entirely on the frontend".
      persist({ ...demoCustomer, email, fullName: email.split('@')[0] })
      return { success: true }
    }
    return { success: false, error: 'Please enter a valid email and password.' }
  }

  const register = async (data) => {
    await new Promise((r) => setTimeout(r, 800))
    const newUser = {
      id: generateCustomerId(),
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      status: 'active',
      joined: new Date().toISOString().slice(0, 10),
      savingsBalance: 0,
      investmentBalance: 0,
      outstandingLoan: 0,
      totalBalance: 0,
    }
    persist(newUser)
    return { success: true }
  }

  const logout = () => persist(null)

  const updateProfile = (updates) => {
    persist({ ...user, ...updates })
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
