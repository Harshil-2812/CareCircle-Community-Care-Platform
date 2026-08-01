import { Routes, Route, Navigate } from 'react-router-dom'
import { LayoutDashboard, Users, ShieldCheck, Building2, Network, Tags, PieChart } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'
import AdminOverview from './AdminOverview'
import AdminUsers from './AdminUsers'
import AdminVerification from './AdminVerification'
import AdminHomes from './AdminHomes'
import AdminNetworks from './AdminNetworks'
import AdminCategories from './AdminCategories'
import AdminAnalytics from './AdminAnalytics'

const navItems = [
  { path: '/admin', label: 'Overview', icon: LayoutDashboard },
  { path: '/admin/analytics', label: 'SQL Analytics', icon: PieChart },
  { path: '/admin/users', label: 'User Management', icon: Users },
  { path: '/admin/verification', label: 'Verification Queue', icon: ShieldCheck },
  { path: '/admin/homes', label: 'Care Homes', icon: Building2 },
  { path: '/admin/networks', label: 'Networks', icon: Network },
  { path: '/admin/categories', label: 'Task Categories', icon: Tags },
]

const titles = {
  '/admin': 'Admin Overview',
  '/admin/users': 'User Management',
  '/admin/verification': 'Verification Queue',
  '/admin/homes': 'Care Home Management',
  '/admin/networks': 'Home Networks',
  '/admin/categories': 'Task Categories',
}

export default function AdminDashboard() {
  return (
    <DashboardLayout navItems={navItems} title="Admin Dashboard">
      <Routes>
        <Route index element={<AdminOverview />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="verification" element={<AdminVerification />} />
        <Route path="homes" element={<AdminHomes />} />
        <Route path="networks" element={<AdminNetworks />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </DashboardLayout>
  )
}
