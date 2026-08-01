import { Routes, Route, Navigate } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, Calendar, ShieldCheck, Sparkles, BookOpen } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'
import VolunteerOverview from './VolunteerOverview'
import VolunteerTasks from './VolunteerTasks'
import VolunteerAvailability from './VolunteerAvailability'
import VolunteerVerification from './VolunteerVerification'
import VolunteerSmartMatch from './VolunteerSmartMatch'
import VolunteerJournal from './VolunteerJournal'

const navItems = [
  { path: '/volunteer',              label: 'Overview',      icon: LayoutDashboard },
  { path: '/volunteer/tasks',        label: 'Browse Tasks',  icon: ClipboardList },
  { path: '/volunteer/match',        label: 'Smart Match',   icon: Sparkles },
  { path: '/volunteer/journal',      label: 'Impact Journal',icon: BookOpen },
  { path: '/volunteer/availability', label: 'My Availability',icon: Calendar },
  { path: '/volunteer/verification', label: 'Verification',  icon: ShieldCheck },
]

export default function VolunteerDashboard() {
  return (
    <DashboardLayout navItems={navItems} title="Volunteer Dashboard">
      <Routes>
        <Route index             element={<VolunteerOverview />} />
        <Route path="tasks"      element={<VolunteerTasks />} />
        <Route path="match"      element={<VolunteerSmartMatch />} />
        <Route path="journal"    element={<VolunteerJournal />} />
        <Route path="availability" element={<VolunteerAvailability />} />
        <Route path="verification" element={<VolunteerVerification />} />
        <Route path="*"          element={<Navigate to="/volunteer" replace />} />
      </Routes>
    </DashboardLayout>
  )
}
