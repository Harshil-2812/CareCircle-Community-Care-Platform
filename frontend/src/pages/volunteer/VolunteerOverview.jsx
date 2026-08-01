import { useEffect, useState } from 'react'
import { ClipboardList, Calendar, CheckCircle, Clock, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const statusColor = { Pending: 'badge-yellow', 'In Progress': 'badge-blue', Completed: 'badge-green', Cancelled: 'badge-red' }

export default function VolunteerOverview() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [assignments, setAssignments] = useState([])
  const [slots, setSlots] = useState([])
  const [verif, setVerif] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/tasks/my-assignments'),
      api.get('/availability/mine'),
      api.get('/verification/status')
    ]).then(([a, s, v]) => {
      setAssignments(a.data.data)
      setSlots(s.data.data)
      setVerif(v.data.data)
    }).finally(() => setLoading(false))
  }, [])

  const completed = assignments.filter(a => a.completion_status === 'Completed').length
  const upcoming = slots.filter(s => new Date(s.available_date) >= new Date()).length

  if (loading) return <div className="flex justify-center h-64 items-center"><div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-white">Hello, <span className="gradient-text">{user?.full_name?.split(' ')[0]}</span>!</h3>
        <p className="text-slate-400 text-sm mt-1">Ready to make a difference today?</p>
      </div>

      {/* Verification alert */}
      {!verif && (
        <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
            <Clock className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-yellow-300 text-sm">Verification Required</div>
            <div className="text-xs text-yellow-400/70">Submit your ID documents to accept tasks.</div>
          </div>
          <button onClick={() => navigate('/volunteer/verification')} className="btn-primary text-xs px-3 py-2">
            Submit <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {verif && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
          verif.background_check_status === 'Approved'
            ? 'bg-emerald-500/10 border-emerald-500/20'
            : verif.background_check_status === 'Pending'
            ? 'bg-yellow-500/10 border-yellow-500/20'
            : 'bg-rose-500/10 border-rose-500/20'
        }`}>
          <CheckCircle className={`w-5 h-5 ${verif.background_check_status === 'Approved' ? 'text-emerald-400' : verif.background_check_status === 'Pending' ? 'text-yellow-400' : 'text-rose-400'}`} />
          <span className="text-sm font-medium text-white">
            Verification Status: <span className={verif.background_check_status === 'Approved' ? 'text-emerald-300' : verif.background_check_status === 'Pending' ? 'text-yellow-300' : 'text-rose-300'}>
              {verif.background_check_status}
            </span>
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Assignments', value: assignments.length, icon: ClipboardList, color: 'from-blue-500 to-blue-700' },
          { label: 'Completed', value: completed, icon: CheckCircle, color: 'from-emerald-500 to-emerald-700' },
          { label: 'Upcoming Slots', value: upcoming, icon: Calendar, color: 'from-purple-500 to-purple-700' },
          { label: 'Active Tasks', value: assignments.filter(a=>a.completion_status==='In Progress').length, icon: Clock, color: 'from-orange-500 to-orange-700' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0`}>
              <s.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-slate-400">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* My Assignments */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-white flex items-center gap-2"><ClipboardList className="w-4 h-4 text-blue-400" />My Assignments</h4>
          <button onClick={() => navigate('/volunteer/tasks')} className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">Browse tasks <ArrowRight className="w-3 h-3" /></button>
        </div>
        {assignments.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>No tasks assigned yet. Browse pending tasks!</p>
            <button onClick={() => navigate('/volunteer/tasks')} className="btn-primary text-xs mt-3">Browse Tasks</button>
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.slice(0, 5).map(a => (
              <div key={a.assignment_id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{a.Tasks?.Elderly_Profiles?.name}</div>
                  <div className="text-xs text-slate-400">{a.Tasks?.Task_Categories?.category_name} · {new Date(a.Tasks?.task_date).toLocaleDateString('en-IN')}</div>
                </div>
                <span className={`badge ${statusColor[a.completion_status]}`}>{a.completion_status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
