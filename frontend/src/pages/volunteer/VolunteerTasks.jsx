import { useEffect, useState } from 'react'
import { ClipboardList, CheckCircle, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export default function VolunteerTasks() {
  const { user } = useAuth()
  const [pendingTasks, setPendingTasks] = useState([])
  const [myAssignments, setMyAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(null)
  const [completing, setCompleting] = useState(null)
  const [tab, setTab] = useState('pending')

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [p, m] = await Promise.all([api.get('/tasks/pending'), api.get('/tasks/my-assignments')])
      setPendingTasks(p.data.data)
      setMyAssignments(m.data.data)
    } catch { toast.error('Failed to load tasks') }
    finally { setLoading(false) }
  }
  useEffect(() => { fetchAll() }, [])

  const claimTask = async (taskId) => {
    setClaiming(taskId)
    try {
      await api.post('/assignments', { task_id: taskId, volunteer_id: user.userId })
      toast.success('Task claimed successfully!')
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to claim task')
    } finally { setClaiming(null) }
  }

  const completeTask = async (assignmentId) => {
    setCompleting(assignmentId)
    try {
      await api.put(`/assignments/${assignmentId}/complete`)
      toast.success('Task marked as completed!')
      fetchAll()
    } catch { toast.error('Failed') }
    finally { setCompleting(null) }
  }

  const statusColor = { Pending: 'badge-yellow', 'In Progress': 'badge-blue', Completed: 'badge-green', Cancelled: 'badge-red' }

  return (
    <div className="space-y-5">
      <h3 className="text-xl font-bold text-white">Tasks</h3>

      <div className="flex gap-2">
        {[['pending', 'Pending Tasks', pendingTasks.length], ['mine', 'My Assignments', myAssignments.length]].map(([key, label, count]) => (
          <button key={key} id={`tab-${key}`} onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === key ? 'bg-primary-600/30 text-primary-300 border border-primary-500/30' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
            {label} <span className="ml-1 opacity-70">({count})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center h-48 items-center"><div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" /></div>
      ) : tab === 'pending' ? (
        <div className="grid gap-4">
          {pendingTasks.length === 0 ? (
            <div className="card text-center py-14">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-50" />
              <p className="text-slate-400">No pending tasks available right now!</p>
            </div>
          ) : pendingTasks.map(t => (
            <div key={t.task_id} className="card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white">{t.Elderly_Profiles?.name}</span>
                    <span className="badge badge-yellow">Pending</span>
                  </div>
                  <div className="text-sm text-slate-400">
                    <span className="text-primary-300 font-medium">{t.Task_Categories?.category_name}</span>
                    {t.Elderly_Homes && ` · ${t.Elderly_Homes.home_name}`}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    📅 {new Date(t.task_date).toLocaleDateString('en-IN')}
                    {t.task_time && ` · ⏰ ${new Date(t.task_time).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}`}
                  </div>
                  {t.description && <div className="text-xs text-slate-400 mt-2 max-w-lg">{t.description}</div>}
                </div>
                <button id={`claim-${t.task_id}`}
                  onClick={() => claimTask(t.task_id)}
                  disabled={claiming === t.task_id}
                  className="btn-primary text-sm flex-shrink-0">
                  {claiming === t.task_id
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <UserCheck className="w-4 h-4" />
                  }
                  Claim Task
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="tbl">
            <thead><tr>
              <th>Elderly</th><th>Category</th><th>Date</th><th>Status</th><th>Assigned</th><th>Action</th>
            </tr></thead>
            <tbody>
              {myAssignments.map(a => (
                <tr key={a.assignment_id}>
                  <td className="font-medium text-white">{a.Tasks?.Elderly_Profiles?.name}</td>
                  <td>{a.Tasks?.Task_Categories?.category_name}</td>
                  <td>{new Date(a.Tasks?.task_date).toLocaleDateString('en-IN')}</td>
                  <td><span className={`badge ${statusColor[a.completion_status]}`}>{a.completion_status}</span></td>
                  <td className="text-xs text-slate-400">{new Date(a.assigned_at).toLocaleDateString('en-IN')}</td>
                  <td>
                    {a.completion_status !== 'Completed' && a.completion_status !== 'Cancelled' && (
                      <button id={`complete-${a.assignment_id}`}
                        onClick={() => completeTask(a.assignment_id)}
                        disabled={completing === a.assignment_id}
                        className="btn-success text-xs px-3 py-1.5">
                        <CheckCircle className="w-3.5 h-3.5" /> Complete
                      </button>
                    )}
                    {a.completion_status === 'Completed' && <span className="badge-green badge">Done ✓</span>}
                  </td>
                </tr>
              ))}
              {myAssignments.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-slate-500">No assignments yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
