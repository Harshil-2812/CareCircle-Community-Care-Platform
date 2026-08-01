import { useEffect, useState } from 'react'
import { Plus, X, ClipboardList, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

const statusColor = { Pending: 'badge-yellow', Assigned: 'badge-blue', Completed: 'badge-green', Cancelled: 'badge-red' }

export default function FamilyTasks() {
  const [tasks, setTasks] = useState([])
  const [elderly, setElderly] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('')
  const [form, setForm] = useState({ elderly_id: '', category_id: '', description: '', task_date: '', task_time: '' })
  const [saving, setSaving] = useState(false)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [t, e, c] = await Promise.all([api.get('/tasks'), api.get('/family-map/my-elderly'), api.get('/categories')])
      setTasks(t.data.data)
      setElderly(e.data.data)
      setCategories(c.data.data)
    } catch { toast.error('Failed to load tasks') }
    finally { setLoading(false) }
  }
  useEffect(() => { fetchAll() }, [])

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await api.post('/tasks', { ...form, elderly_id: parseInt(form.elderly_id), category_id: parseInt(form.category_id) })
      toast.success('Task created!'); setShowForm(false); setForm({ elderly_id: '', category_id: '', description: '', task_date: '', task_time: '' }); fetchAll()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const filtered = filter ? tasks.filter(t => t.status === filter) : tasks

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-xl font-bold text-white">Tasks ({tasks.length})</h3>
        <button id="create-task-btn" onClick={() => setShowForm(v => !v)} className="btn-primary text-sm">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Create Task'}
        </button>
      </div>

      {showForm && (
        <div className="card animate-fadein">
          <h4 className="font-bold text-white mb-4">New Task</h4>
          <form onSubmit={handleCreate} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Elderly *</label>
              <select className="input" value={form.elderly_id} onChange={e=>setForm(p=>({...p,elderly_id:e.target.value}))} required>
                <option value="">— Select Elderly —</option>
                {elderly.map(e=><option key={e.map_id} value={e.elderly?.elderly_id}>{e.elderly?.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Category *</label>
              <select className="input" value={form.category_id} onChange={e=>setForm(p=>({...p,category_id:e.target.value}))} required>
                <option value="">— Select Category —</option>
                {categories.map(c=><option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Task Date *</label>
              <input type="date" className="input" value={form.task_date} onChange={e=>setForm(p=>({...p,task_date:e.target.value}))} required />
            </div>
            <div>
              <label className="label">Task Time</label>
              <input type="time" className="input" value={form.task_time} onChange={e=>setForm(p=>({...p,task_time:e.target.value}))} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea className="input h-20 resize-none" value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                Create Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['', 'Pending', 'Assigned', 'Completed', 'Cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === s ? 'bg-primary-600/40 text-primary-300 border border-primary-500/30' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
            {s || 'All'} {s === '' && `(${tasks.length})`}
            {s !== '' && `(${tasks.filter(t=>t.status===s).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center h-40 items-center"><div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="tbl">
            <thead><tr>
              <th>Elderly</th><th>Category</th><th>Date</th><th>Time</th><th>Description</th><th>Status</th><th>Assigned To</th>
            </tr></thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.task_id}>
                  <td className="font-medium text-white">{t.Elderly_Profiles?.name}</td>
                  <td>{t.Task_Categories?.category_name}</td>
                  <td>{new Date(t.task_date).toLocaleDateString('en-IN')}</td>
                  <td>{t.task_time ? new Date(t.task_time).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}) : '—'}</td>
                  <td className="max-w-xs truncate text-slate-400">{t.description || '—'}</td>
                  <td><span className={`badge ${statusColor[t.status]}`}>{t.status}</span></td>
                  <td>{t.Task_Assignments?.Users?.full_name || <span className="text-slate-600">Unassigned</span>}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="text-center py-10 text-slate-500">No tasks found</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
