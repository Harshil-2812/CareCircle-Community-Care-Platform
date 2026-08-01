import { useEffect, useState } from 'react'
import { Tags, Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

const categoryIcons = ['🛒','🏥','🤝','💊','🔧','🚗','📋','🎯']

export default function AdminCategories() {
  const [cats, setCats] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  const fetch = async () => {
    setLoading(true)
    try { const { data } = await api.get('/categories'); setCats(data.data) }
    catch { toast.error('Failed') }
    finally { setLoading(false) }
  }
  useEffect(() => { fetch() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await api.post('/categories', { category_name: name })
      toast.success('Category created!'); setName(''); setShowForm(false); fetch()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Task Categories</h3>
        <button id="add-category-btn" onClick={() => setShowForm(v => !v)} className="btn-primary text-sm">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Add Category'}
        </button>
      </div>
      {showForm && (
        <div className="card animate-fadein">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input id="category-name" className="input flex-1" placeholder="Category name..." value={name} onChange={e => setName(e.target.value)} required />
            <button type="submit" className="btn-primary" disabled={saving}><Plus className="w-4 h-4" />Add</button>
          </form>
        </div>
      )}
      {loading ? (
        <div className="flex justify-center h-40 items-center"><div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {cats.map((c, i) => (
            <div key={c.category_id} className="card flex items-center gap-3">
              <span className="text-2xl">{categoryIcons[i % categoryIcons.length]}</span>
              <div>
                <div className="font-medium text-white">{c.category_name}</div>
                <div className="text-xs text-slate-500">ID: {c.category_id}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
