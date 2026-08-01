import { useEffect, useState } from 'react'
import { Plus, X, Heart, Trash2, Link2, ChevronDown, ChevronUp, FileText, Phone, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

// ── Per-patient expanded detail panel ─────────────────────────────────────────
function ElderlyDetail({ elderlyId, onClose }) {
  const [notes, setNotes]       = useState([])
  const [contacts, setContacts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [newNote, setNewNote]   = useState('')
  const [addingNote, setAddingNote] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [n, c] = await Promise.all([
        api.get(`/elderly/${elderlyId}/notes`),
        api.get(`/elderly/${elderlyId}/contacts`)
      ])
      setNotes(n.data.data)
      setContacts(c.data.data)
    } catch { toast.error('Failed to load details') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [elderlyId])

  const handleAddNote = async () => {
    if (!newNote.trim()) return
    setAddingNote(true)
    try {
      await api.post(`/elderly/${elderlyId}/notes`, { condition_note: newNote })
      toast.success('Medical note added!')
      setNewNote('')
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add note') }
    finally { setAddingNote(false) }
  }

  const handleDeleteNote = async (noteId) => {
    try {
      await api.delete(`/elderly/${elderlyId}/notes/${noteId}`)
      toast.success('Note removed')
      load()
    } catch { toast.error('Failed to delete note') }
  }

  if (loading) return (
    <div className="flex justify-center py-6">
      <div className="w-6 h-6 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="mt-4 border-t border-white/10 pt-4 space-y-4">

      {/* Medical Notes */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-3.5 h-3.5 text-rose-400" />
          <span className="text-xs font-semibold text-rose-300 uppercase tracking-wide">Medical History</span>
        </div>
        {notes.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No medical notes on record.</p>
        ) : (
          <ul className="space-y-2">
            {notes.map(n => (
              <li key={n.note_id} className="flex items-start justify-between gap-2 bg-white/5 rounded-lg px-3 py-2">
                <div>
                  <p className="text-xs text-slate-200">{n.condition_note}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{new Date(n.noted_at).toLocaleDateString()}</p>
                </div>
                <button onClick={() => handleDeleteNote(n.note_id)} className="text-slate-600 hover:text-rose-400 transition-colors flex-shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Add New Note */}
        <div className="flex gap-2 mt-3">
          <input
            className="input text-xs py-1.5 flex-1"
            placeholder="Add a new medical note…"
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddNote()}
          />
          <button
            className="btn-primary text-xs px-3 py-1.5"
            onClick={handleAddNote}
            disabled={addingNote || !newNote.trim()}
          >
            {addingNote ? <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Phone className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-semibold text-amber-300 uppercase tracking-wide">Emergency Contacts</span>
        </div>
        {contacts.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No emergency contacts on record.</p>
        ) : (
          <ul className="space-y-1.5">
            {contacts.map(c => (
              <li key={c.contact_id} className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-2">
                <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-300 text-xs font-bold flex-shrink-0">
                  {c.contact_name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-slate-200 truncate">{c.contact_name}</div>
                  <div className="text-[10px] text-slate-400">{c.relation} · {c.contact_phone}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function FamilyElderly() {
  const [elderly, setElderly]         = useState([])
  const [locations, setLocations]     = useState([])
  const [loading, setLoading]         = useState(true)
  const [tab, setTab]                 = useState('list')
  const [form, setForm]               = useState({ name: '', date_of_birth: '', gender: 'Male', living_type: 'Home', location_id: '', relation_type: '' })
  const [linkElderId, setLinkElderId] = useState('')
  const [linkRelation, setLinkRelation] = useState('')
  const [saving, setSaving]           = useState(false)
  const [expandedId, setExpandedId]   = useState(null)   // which elderly card is expanded

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [e, l] = await Promise.all([api.get('/family-map/my-elderly'), api.get('/locations')])
      setElderly(e.data.data)
      setLocations(l.data.data)
    } catch { toast.error('Failed to load data') }
    finally { setLoading(false) }
  }
  useEffect(() => { fetchAll() }, [])

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await api.post('/elderly', { ...form, location_id: form.location_id || null })
      toast.success('Elderly profile created & linked!')
      setTab('list'); fetchAll()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const handleLink = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await api.post('/family-map', { elderly_id: parseInt(linkElderId), relation_type: linkRelation })
      toast.success('Elderly linked!'); setTab('list'); fetchAll()
    } catch (err) { toast.error(err.response?.data?.message || 'Already linked or not found') }
    finally { setSaving(false) }
  }

  const handleUnlink = async (mapId) => {
    if (!confirm('Unlink this elderly from your account?')) return
    try {
      await api.delete(`/family-map/${mapId}`)
      toast.success('Elderly unlinked'); fetchAll()
    } catch { toast.error('Failed') }
  }

  const toggleExpand = (elderlyId) => setExpandedId(prev => prev === elderlyId ? null : elderlyId)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-xl font-bold text-white">My Elderly ({elderly.length})</h3>
        <div className="flex gap-2">
          <button id="add-elderly-btn" onClick={() => setTab(t => t === 'add' ? 'list' : 'add')} className={`btn-primary text-sm ${tab === 'add' ? 'opacity-70' : ''}`}>
            {tab === 'add' ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {tab === 'add' ? 'Cancel' : 'Add New Elderly'}
          </button>
          <button id="link-elderly-btn" onClick={() => setTab(t => t === 'link' ? 'list' : 'link')} className="btn-secondary text-sm">
            {tab === 'link' ? <X className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
            {tab === 'link' ? 'Cancel' : 'Link Existing'}
          </button>
        </div>
      </div>

      {/* Add Form */}
      {tab === 'add' && (
        <div className="card animate-fadein">
          <h4 className="font-bold text-white mb-4">Register New Elderly Profile</h4>
          <form onSubmit={handleCreate} className="grid sm:grid-cols-2 gap-4">
            <div><label className="label">Full Name *</label><input className="input" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} required /></div>
            <div><label className="label">Date of Birth *</label><input type="date" className="input" value={form.date_of_birth} onChange={e=>setForm(p=>({...p,date_of_birth:e.target.value}))} required /></div>
            <div><label className="label">Gender</label>
              <select className="input" value={form.gender} onChange={e=>setForm(p=>({...p,gender:e.target.value}))}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div><label className="label">Living Type *</label>
              <select className="input" value={form.living_type} onChange={e=>setForm(p=>({...p,living_type:e.target.value}))}>
                <option value="Home">Home</option><option value="Care_Home">Care Home</option>
              </select>
            </div>
            <div><label className="label">Location</label>
              <select className="input" value={form.location_id} onChange={e=>setForm(p=>({...p,location_id:e.target.value}))}>
                <option value="">— Select —</option>
                {locations.map(l=><option key={l.location_id} value={l.location_id}>{l.address_line}, {l.Postal_Codes?.city}</option>)}
              </select>
            </div>
            <div><label className="label">Your Relation *</label><input className="input" placeholder="e.g. Son, Daughter" value={form.relation_type} onChange={e=>setForm(p=>({...p,relation_type:e.target.value}))} required /></div>
            <div className="sm:col-span-2">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                Create Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Link Form */}
      {tab === 'link' && (
        <div className="card animate-fadein">
          <h4 className="font-bold text-white mb-4">Link Existing Elderly Profile</h4>
          <form onSubmit={handleLink} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1"><label className="label">Elderly ID</label><input type="number" className="input" placeholder="Enter elderly ID" value={linkElderId} onChange={e=>setLinkElderId(e.target.value)} required /></div>
            <div className="flex-1"><label className="label">Your Relation</label><input className="input" placeholder="e.g. Daughter" value={linkRelation} onChange={e=>setLinkRelation(e.target.value)} /></div>
            <div className="flex items-end"><button type="submit" className="btn-primary" disabled={saving}><Link2 className="w-4 h-4" />Link</button></div>
          </form>
        </div>
      )}

      {/* Cards */}
      {loading ? (
        <div className="flex justify-center h-40 items-center"><div className="w-8 h-8 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {elderly.map(e => {
            const isExpanded = expandedId === e.elderly?.elderly_id
            return (
              <div key={e.map_id} className="card flex flex-col">
                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-rose-600/20 flex items-center justify-center text-rose-300 font-bold text-lg flex-shrink-0">
                      {e.elderly?.name?.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{e.elderly?.name}</div>
                      <div className="text-xs text-slate-400">{e.relation_type}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => handleUnlink(e.map_id)} className="text-slate-600 hover:text-rose-400 transition-colors" title="Unlink">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="mt-4 space-y-1.5 text-xs text-slate-400">
                  <div>Age: <span className="text-slate-200">{e.elderly?.age} years</span></div>
                  <div>Gender: <span className="text-slate-200">{e.elderly?.gender || '—'}</span></div>
                  <div>Living: <span className={`badge ${e.elderly?.living_type === 'Home' ? 'badge-blue' : 'badge-purple'} ml-1`}>{e.elderly?.living_type}</span></div>
                </div>

                {/* Expand Toggle */}
                <button
                  onClick={() => toggleExpand(e.elderly?.elderly_id)}
                  className="mt-4 flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-300 transition-colors self-start"
                >
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  {isExpanded ? 'Hide Details' : 'Medical History & Contacts'}
                </button>

                {/* Expanded Detail Panel */}
                {isExpanded && <ElderlyDetail elderlyId={e.elderly?.elderly_id} />}
              </div>
            )
          })}
          {elderly.length === 0 && (
            <div className="sm:col-span-3 text-center py-14 text-slate-500">
              <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No elderly linked to your account yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
