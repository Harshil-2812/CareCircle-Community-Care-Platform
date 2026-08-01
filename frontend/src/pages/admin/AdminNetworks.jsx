import { useEffect, useState } from 'react'
import { Network, Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

export default function AdminNetworks() {
  const [nets, setNets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ network_name: '', description: '' })
  const [saving, setSaving] = useState(false)

  const fetch = async () => {
    setLoading(true)
    try { const { data } = await api.get('/networks'); setNets(data.data) }
    catch { toast.error('Failed to load networks') }
    finally { setLoading(false) }
  }
  useEffect(() => { fetch() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await api.post('/networks', form)
      toast.success('Network created!'); setShowForm(false); setForm({ network_name: '', description: '' }); fetch()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Home Networks</h3>
        <button id="add-network-btn" onClick={() => setShowForm(v => !v)} className="btn-primary text-sm">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Add Network'}
        </button>
      </div>
      {showForm && (
        <div className="card animate-fadein">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="label">Network Name *</label><input className="input" value={form.network_name} onChange={e=>setForm(p=>({...p,network_name:e.target.value}))} required /></div>
            <div><label className="label">Description</label><textarea className="input h-20 resize-none" value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} /></div>
            <button type="submit" className="btn-primary" disabled={saving}><Plus className="w-4 h-4" />Create</button>
          </form>
        </div>
      )}
      {loading ? (
        <div className="flex justify-center h-40 items-center"><div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {nets.map(n => (
            <div key={n.network_id} className="card">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600/20 flex items-center justify-center flex-shrink-0">
                  <Network className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <div className="font-semibold text-white">{n.network_name}</div>
                  {n.description && <div className="text-sm text-slate-400 mt-1">{n.description}</div>}
                  <div className="text-xs text-slate-500 mt-2">
                    {n.Home_Network_Map?.length || 0} home{n.Home_Network_Map?.length !== 1 ? 's' : ''} in network
                  </div>
                </div>
              </div>
            </div>
          ))}
          {nets.length === 0 && <div className="sm:col-span-2 text-center py-12 text-slate-500">No networks created yet.</div>}
        </div>
      )}
    </div>
  )
}
