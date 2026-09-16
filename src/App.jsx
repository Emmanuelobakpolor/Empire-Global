import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AdminAuthProvider } from './context/AdminAuthContext'
import { DataStoreProvider } from './context/DataStoreContext'
import { ToastProvider } from './context/ToastContext'
import WhatsAppButton from './components/WhatsAppButton'

import ProtectedRoute from './routes/ProtectedRoute'
import AdminProtectedRoute from './routes/AdminProtectedRoute'

import CustomerLayout from './components/customer/CustomerLayout'
import AdminLayout from './components/admin/AdminLayout'

// Public
import Landing from './pages/public/Landing'
import Login from './pages/public/Login'
import Register from './pages/public/Register'
import ForgotPassword from './pages/public/ForgotPassword'

// Customer
import Dashboard from './pages/customer/Dashboard'
import Products from './pages/customer/Products'
import ProductDetails from './pages/customer/ProductDetails'
import CreateTransaction from './pages/customer/CreateTransaction'
import PaymentInstructions from './pages/customer/PaymentInstructions'
import UploadReceipt from './pages/customer/UploadReceipt'
import Transactions from './pages/customer/Transactions'
import TransactionDetails from './pages/customer/TransactionDetails'
import Profile from './pages/customer/Profile'
import Notifications from './pages/customer/Notifications'
import Savings from './pages/customer/Savings'
import Investments from './pages/customer/Investments'
import Loans from './pages/customer/Loans'
import HirePurchase from './pages/customer/HirePurchase'
import Support from './pages/customer/Support'

// Admin
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import Customers from './pages/admin/Customers'
import CustomerDetails from './pages/admin/CustomerDetails'
import Payments from './pages/admin/Payments'
import PaymentDetails from './pages/admin/PaymentDetails'
import AdminTransactions from './pages/admin/AdminTransactions'
import AdminTransactionDetails from './pages/admin/AdminTransactionDetails'
import AdminProducts from './pages/admin/AdminProducts'
import Reports from './pages/admin/Reports'
import BankDetailsPage from './pages/admin/BankDetailsPage'
import AuditLogs from './pages/admin/AuditLogs'
import AdminSettings from './pages/admin/AdminSettings'

import NotFound from './pages/NotFound'

export default function App() {
  return (
    <ToastProvider>
      <DataStoreProvider>
        <AuthProvider>
          <AdminAuthProvider>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Customer Portal */}
              <Route
                path="/customer"
                element={
                  <ProtectedRoute>
                    <CustomerLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="products" element={<Products />} />
                <Route path="products/:id" element={<ProductDetails />} />
                <Route path="transactions/new" element={<CreateTransaction />} />
                <Route path="payment" element={<PaymentInstructions />} />
                <Route path="upload-receipt" element={<UploadReceipt />} />
                <Route path="transactions" element={<Transactions />} />
                <Route path="transactions/:id" element={<TransactionDetails />} />
                <Route path="savings" element={<Savings />} />
                <Route path="investments" element={<Investments />} />
                <Route path="loans" element={<Loans />} />
                <Route path="hire-purchase" element={<HirePurchase />} />
                <Route path="profile" element={<Profile />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="support" element={<Support />} />
              </Route>

              {/* Admin Portal */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout />
                  </AdminProtectedRoute>
                }
              >
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="customers" element={<Customers />} />
                <Route path="customers/:id" element={<CustomerDetails />} />
                <Route path="payments" element={<Payments />} />
                <Route path="payments/:id" element={<PaymentDetails />} />
                <Route path="transactions" element={<AdminTransactions />} />
                <Route path="transactions/:id" element={<AdminTransactionDetails />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="reports" element={<Reports />} />
                <Route path="bank-details" element={<BankDetailsPage />} />
                <Route path="audit-logs" element={<AuditLogs />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
            <WhatsAppButton />
          </AdminAuthProvider>
        </AuthProvider>
      </DataStoreProvider>
    </ToastProvider>
  )
}
