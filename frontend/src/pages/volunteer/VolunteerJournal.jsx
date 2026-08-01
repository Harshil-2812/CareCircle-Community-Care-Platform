import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Plus, X, Smile, Meh, Frown, Trash2, Star, Award } from 'lucide-react'
import toast from 'react-hot-toast'

const STORAGE_KEY = 'cc_impact_journal'
const MOODS = [
  { key: 'great',  label: 'Felt great!',      icon: Smile, color: '#10b981', bg: '#10b98122' },
  { key: 'okay',   label: 'It was okay',      icon: Meh,   color: '#f97316', bg: '#f9731622' },
  { key: 'tough',  label: 'Challenging day',  icon: Frown, color: '#f43f5e', bg: '#f43f5e22' },
]
const IMPACT_TAGS = ['Made them smile 😊','Helped with medication 💊','Kept company 🤝','Transport 🚗','Tech help 💻','Cooked together 🍳','Reading 📖']

function load() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] } }
function save(d) { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)) }

export default function VolunteerJournal() {
  const [entries, setEntries] = useState(load)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], patient: '', mood: 'great', tags: [], note: '' })

  const fv = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const toggleTag = (t) => fv('tags', form.tags.includes(t) ? form.tags.filter(x => x !== t) : [...form.tags, t])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.patient.trim()) return toast.error('Add a patient name')
    const entry = { id: Date.now(), ...form }
    const updated = [entry, ...entries]
    setEntries(updated); save(updated)
    toast.success('Journal entry saved!')
    setShowForm(false)
    setForm({ date: new Date().toISOString().split('T')[0], patient: '', mood: 'great', tags: [], note: '' })
  }

  const deleteEntry = (id) => { const u = entries.filter(e => e.id !== id); setEntries(u); save(u) }

  const totalSmiles = entries.filter(e => e.mood === 'great').length
  const uniquePatients = new Set(entries.map(e => e.patient)).size

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-400" /> Impact Journal
          </h3>
          <p className="text-slate-400 text-sm mt-1">Log moments that matter and track your volunteering journey.</p>
        </div>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={() => setShowForm(v => !v)} className={`btn-primary text-sm ${showForm ? 'opacity-70' : ''}`}
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Log Entry'}
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Journal Entries', value: entries.length,   icon: BookOpen, color: 'from-purple-500 to-pink-500' },
          { label: 'Great Days',      value: totalSmiles,      icon: Star,     color: 'from-yellow-500 to-orange-500' },
          { label: 'Patients Met',    value: uniquePatients,   icon: Award,    color: 'from-emerald-500 to-teal-500' },
        ].map((s, i) => (
          <motion.div key={s.label} className="stat-card"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-slate-400">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* New Entry Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="card" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <h4 className="font-bold text-white mb-5">New Journal Entry</h4>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Date</label>
                  <input type="date" className="input" value={form.date} onChange={e => fv('date', e.target.value)} required />
                </div>
                <div>
                  <label className="label">Patient / Elderly Name</label>
                  <input className="input" placeholder="Who did you visit?" value={form.patient} onChange={e => fv('patient', e.target.value)} required />
                </div>
              </div>

              {/* Mood Selector */}
              <div>
                <label className="label">How did it go?</label>
                <div className="flex gap-3 mt-1">
                  {MOODS.map(m => (
                    <button key={m.key} type="button"
                      onClick={() => fv('mood', m.key)}
                      className="flex-1 flex flex-col items-center gap-2 py-3 rounded-2xl transition-all border cursor-pointer"
                      style={{
                        background: form.mood === m.key ? m.bg : 'rgba(255,255,255,0.03)',
                        borderColor: form.mood === m.key ? m.color + '60' : 'rgba(255,255,255,0.06)',
                      }}
                    >
                      <m.icon className="w-6 h-6" style={{ color: m.color }} />
                      <span className="text-xs font-semibold" style={{ color: form.mood === m.key ? m.color : '#64748b' }}>
                        {m.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Impact Tags */}
              <div>
                <label className="label">What did you do? (select all that apply)</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {IMPACT_TAGS.map(t => {
                    const on = form.tags.includes(t)
                    return (
                      <button key={t} type="button" onClick={() => toggleTag(t)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border"
                        style={{
                          background: on ? 'rgba(96,137,255,0.2)' : 'rgba(255,255,255,0.04)',
                          borderColor: on ? 'rgba(96,137,255,0.4)' : 'rgba(255,255,255,0.06)',
                          color: on ? '#93c5fd' : '#64748b',
                        }}
                      >{t}</button>
                    )
                  })}
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="label">Reflection (optional)</label>
                <textarea className="input h-24 resize-none" placeholder="Describe a meaningful moment from today's visit…"
                  value={form.note} onChange={e => fv('note', e.target.value)} />
              </div>

              <button type="submit" className="btn-primary">
                <BookOpen className="w-4 h-4" /> Save Entry
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline */}
      {entries.length === 0 ? (
        <div className="card text-center py-16 text-slate-500">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Your journal is empty.</p>
          <p className="text-sm mt-1">Log your first entry after a visit to start your impact story.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((e, i) => {
            const mood = MOODS.find(m => m.key === e.mood)
            return (
              <motion.div key={e.id}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="card"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl"
                      style={{ background: mood?.bg }}>
                      <mood.icon className="w-6 h-6" style={{ color: mood?.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white">{e.patient}</span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-400">
                          {new Date(e.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: mood?.bg, color: mood?.color }}>{mood?.label}</span>
                      </div>
                      {e.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {e.tags.map(t => (
                            <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-slate-300">{t}</span>
                          ))}
                        </div>
                      )}
                      {e.note && <p className="text-sm text-slate-300 mt-2 italic leading-relaxed">"{e.note}"</p>}
                    </div>
                  </div>
                  <button onClick={() => deleteEntry(e.id)}
                    className="p-2 rounded-xl hover:bg-rose-500/20 text-slate-600 hover:text-rose-400 transition-colors flex-shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
