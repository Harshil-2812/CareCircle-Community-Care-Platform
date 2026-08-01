import { Routes, Route, Navigate } from 'react-router-dom'
import { LayoutDashboard, Heart, ClipboardList, Activity, CalendarDays } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'
import FamilyOverview from './FamilyOverview'
import FamilyElderly from './FamilyElderly'
import FamilyTasks from './FamilyTasks'
import HealthMonitor from './HealthMonitor'
import FamilyAppointments from './FamilyAppointments'

const navItems = [
  { path: '/family',              label: 'Overview',        icon: LayoutDashboard },
  { path: '/family/elderly',      label: 'My Elderly',      icon: Heart },
  { path: '/family/tasks',        label: 'Tasks',           icon: ClipboardList },
  { path: '/family/appointments', label: 'Appointments',    icon: CalendarDays },
  { path: '/family/health',       label: 'Health Monitor',  icon: Activity },
]

export default function FamilyDashboard() {
  return (
    <DashboardLayout navItems={navItems} title="Family Dashboard">
      <Routes>
        <Route index                  element={<FamilyOverview />} />
        <Route path="elderly"         element={<FamilyElderly />} />
        <Route path="tasks"           element={<FamilyTasks />} />
        <Route path="appointments"    element={<FamilyAppointments />} />
        <Route path="health"          element={<HealthMonitor />} />
        <Route path="*"               element={<Navigate to="/family" replace />} />
      </Routes>
    </DashboardLayout>
  )
}
