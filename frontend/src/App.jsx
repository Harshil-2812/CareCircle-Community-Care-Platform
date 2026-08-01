import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import FamilyDashboard from './pages/family/FamilyDashboard'
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !user.roles.some(r => allowedRoles.includes(r))) {
    return <Navigate to="/login" replace />
  }
  return children
}

const RoleRedirect = () => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.roles.includes('Admin')) return <Navigate to="/admin" replace />
  if (user.roles.includes('Family')) return <Navigate to="/family" replace />
  if (user.roles.includes('Volunteer')) return <Navigate to="/volunteer" replace />
  return <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<RoleRedirect />} />
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={['Admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/family/*" element={
        <ProtectedRoute allowedRoles={['Family']}>
          <FamilyDashboard />
        </ProtectedRoute>
      } />
      <Route path="/volunteer/*" element={
        <ProtectedRoute allowedRoles={['Volunteer']}>
          <VolunteerDashboard />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
