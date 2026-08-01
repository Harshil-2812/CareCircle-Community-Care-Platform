import { useEffect, useState } from 'react'
import { Building2, Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

export default function AdminHomes() {
  const [homes, setHomes] = useState([])
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ home_name: '', registration_number: '', capacity: '', phone: '', email: '', location_id: '', status: 'Active' })
  const [saving, setSaving] = useState(false)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [h, l] = await Promise.all([api.get('/homes'), api.get('/locations')])
      setHomes(h.data.data)
      setLocations(l.data.data)
    } catch { toast.error('Failed to load data') }
    finally { setLoading(false) }
  }
  useEffect(() => { fetchAll() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/homes', { ...form, capacity: parseInt(form.capacity), location_id: form.location_id || null })
      toast.success('Care home created!')
      setShowForm(false)
      setForm({ home_name: '', registration_number: '', capacity: '', phone: '', email: '', location_id: '', status: 'Active' })
      fetchAll()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create home') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Care Home Management</h3>
        <button id="add-home-btn" onClick={() => setShowForm(v => !v)} className="btn-primary text-sm">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Add Home'}
        </button>
      </div>

      {showForm && (
        <div className="card animate-fadein">
          <h4 className="font-semibold text-white mb-4">New Care Home</h4>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">Home Name *</label><input className="input" value={form.home_name} onChange={e => setForm(p=>({...p,home_name:e.target.value}))} required /></div>
            <div><label className="label">Registration No.</label><input className="input" value={form.registration_number} onChange={e => setForm(p=>({...p,registration_number:e.target.value}))} /></div>
            <div><label className="label">Capacity *</label><input type="number" min="1" className="input" value={form.capacity} onChange={e => setForm(p=>({...p,capacity:e.target.value}))} required /></div>
            <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm(p=>({...p,phone:e.target.value}))} /></div>
            <div><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} /></div>
            <div>
              <label className="label">Location</label>
              <select className="input" value={form.location_id} onChange={e => setForm(p=>({...p,location_id:e.target.value}))}>
                <option value="">— Select Location —</option>
                {locations.map(l => <option key={l.location_id} value={l.location_id}>{l.address_line}, {l.Postal_Codes?.city}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => setForm(p=>({...p,status:e.target.value}))}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                Create Home
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center h-48 items-center"><div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {homes.map(h => (
            <div key={h.home_id} className="card-hover">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-600/20 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white truncate">{h.home_name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{h.Locations?.Postal_Codes?.city || '—'}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`badge ${h.status === 'Active' ? 'badge-green' : 'badge-gray'}`}>{h.status}</span>
                    <span className="text-xs text-slate-400">Cap: {h.capacity}</span>
                  </div>
                  {h.phone && <div className="text-xs text-slate-500 mt-1">{h.phone}</div>}
                  {h.registration_number && <div className="text-xs text-slate-500 font-mono">{h.registration_number}</div>}
                </div>
              </div>
            </div>
          ))}
          {homes.length === 0 && (
            <div className="sm:col-span-3 text-center py-14 text-slate-500">No care homes added yet.</div>
          )}
        </div>
      )}
    </div>
  )
}
