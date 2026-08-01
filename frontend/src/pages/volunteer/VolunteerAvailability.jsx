import { useEffect, useState } from 'react'
import { Calendar, Plus, X, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

export default function VolunteerAvailability() {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ available_date: '', start_time: '', end_time: '' })
  const [saving, setSaving] = useState(false)

  const fetchSlots = async () => {
    setLoading(true)
    try { const { data } = await api.get('/availability/mine'); setSlots(data.data) }
    catch { toast.error('Failed to load slots') }
    finally { setLoading(false) }
  }
  useEffect(() => { fetchSlots() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await api.post('/availability', form)
      toast.success('Availability slot added!'); setShowForm(false); setForm({ available_date: '', start_time: '', end_time: '' }); fetchSlots()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this availability slot?')) return
    try {
      await api.delete(`/availability/${id}`)
      toast.success('Slot removed'); fetchSlots()
    } catch { toast.error('Failed') }
  }

  const upcoming = slots.filter(s => new Date(s.available_date) >= new Date())
  const past = slots.filter(s => new Date(s.available_date) < new Date())

  const fmt = (t) => {
    if (!t) return '—'
    const d = new Date(t)
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">My Availability</h3>
          <p className="text-slate-400 text-sm">{upcoming.length} upcoming slot{upcoming.length !== 1 ? 's' : ''}</p>
        </div>
        <button id="add-slot-btn" onClick={() => setShowForm(v => !v)} className="btn-primary text-sm">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Add Slot'}
        </button>
      </div>

      {showForm && (
        <div className="card animate-fadein">
          <h4 className="font-semibold text-white mb-4">New Availability Slot</h4>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Date *</label>
              <input type="date" id="slot-date" className="input" value={form.available_date} onChange={e=>setForm(p=>({...p,available_date:e.target.value}))}
                min={new Date().toISOString().split('T')[0]} required />
            </div>
            <div>
              <label className="label">Start Time *</label>
              <input type="time" id="slot-start" className="input" value={form.start_time} onChange={e=>setForm(p=>({...p,start_time:e.target.value}))} required />
            </div>
            <div>
              <label className="label">End Time *</label>
              <input type="time" id="slot-end" className="input" value={form.end_time} onChange={e=>setForm(p=>({...p,end_time:e.target.value}))} required />
            </div>
            <div className="sm:col-span-3">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                Add Slot
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center h-40 items-center"><div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Upcoming ({upcoming.length})</h4>
            {upcoming.length === 0 ? (
              <div className="card text-center py-8">
                <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No upcoming availability. Add slots to accept tasks.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {upcoming.map(s => (
                  <div key={s.slot_id} className="card flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600/20 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{new Date(s.available_date).toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'})}</div>
                        <div className="text-xs text-slate-400">{fmt(s.start_time)} – {fmt(s.end_time)}</div>
                      </div>
                    </div>
                    <button id={`del-slot-${s.slot_id}`} onClick={() => handleDelete(s.slot_id)} className="text-slate-600 hover:text-rose-400 transition-colors flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {past.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Past ({past.length})</h4>
              <div className="card p-0 overflow-hidden">
                <table className="tbl">
                  <thead><tr><th>Date</th><th>Start</th><th>End</th></tr></thead>
                  <tbody>
                    {past.slice(0, 5).map(s => (
                      <tr key={s.slot_id}>
                        <td>{new Date(s.available_date).toLocaleDateString('en-IN')}</td>
                        <td>{fmt(s.start_time)}</td>
                        <td>{fmt(s.end_time)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
