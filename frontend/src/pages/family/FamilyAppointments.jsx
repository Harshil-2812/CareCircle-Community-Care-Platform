import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays, Plus, X, Clock, MapPin, Heart, Trash2, Bell, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

const STORAGE_KEY = 'cc_appointments'
const VISIT_TYPES = ['In-person Visit', 'Video Call', 'Phone Call', 'Accompanied Outing', 'Medical Escort']
const TIME_SLOTS  = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00']

function loadAppts() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function saveAppts(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) }

function daysInMonth(month, year) { return new Date(year, month + 1, 0).getDate() }
function firstDay(month, year)    { return new Date(year, month, 1).getDay() }

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const STATUS_COLOR = { Upcoming: 'badge-blue', Completed: 'badge-green', Cancelled: 'badge-red' }

export default function FamilyAppointments() {
  const [elderly, setElderly]     = useState([])
  const [appts, setAppts]         = useState(loadAppts)
  const [showForm, setShowForm]   = useState(false)
  const [selectedDate, setSelectedDate] = useState('')

  const today = new Date()
  const [calMonth, setCalMonth]   = useState(today.getMonth())
  const [calYear,  setCalYear]    = useState(today.getFullYear())

  const [form, setForm] = useState({
    elderly_id: '', visit_type: VISIT_TYPES[0], date: '', time: TIME_SLOTS[0], notes: '',
  })
  const fv = (k, v) => setForm(p => ({ ...p, [k]: v }))

  useEffect(() => {
    api.get('/family-map/my-elderly')
      .then(r => setElderly(r.data.data))
      .catch(() => {})
  }, [])

  const handleCreate = (e) => {
    e.preventDefault()
    const elderly_name = elderly.find(el => String(el.elderly?.elderly_id) === String(form.elderly_id))?.elderly?.name || '—'
    const newAppt = {
      id: Date.now(),
      elderly_id: form.elderly_id,
      elderly_name,
      visit_type: form.visit_type,
      date: form.date,
      time: form.time,
      notes: form.notes,
      status: 'Upcoming',
    }
    const updated = [...appts, newAppt].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    setAppts(updated)
    saveAppts(updated)
    toast.success('Appointment booked!')
    setShowForm(false)
    setForm({ elderly_id: '', visit_type: VISIT_TYPES[0], date: '', time: TIME_SLOTS[0], notes: '' })
  }

  const markDone  = (id) => { const u = appts.map(a => a.id === id ? { ...a, status: 'Completed' } : a); setAppts(u); saveAppts(u); toast.success('Marked complete') }
  const deleteAppt = (id) => { const u = appts.filter(a => a.id !== id); setAppts(u); saveAppts(u) }

  const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) } else setCalMonth(m => m - 1) }
  const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) } else setCalMonth(m => m + 1) }

  const days        = daysInMonth(calMonth, calYear)
  const startOffset = firstDay(calMonth, calYear)
  const todayStr    = today.toISOString().split('T')[0]

  const datesWithAppt = new Set(appts.map(a => a.date))
  const apptOnSelected = selectedDate ? appts.filter(a => a.date === selectedDate) : []

  const upcoming  = appts.filter(a => a.date >= todayStr && a.status === 'Upcoming').length
  const completed = appts.filter(a => a.status === 'Completed').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-primary-400" /> Appointments
          </h3>
          <p className="text-slate-400 text-sm mt-1">Schedule and manage visits with your elderly.</p>
        </div>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={() => setShowForm(v => !v)}
          className={`btn-primary text-sm ${showForm ? 'opacity-70' : ''}`}
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Book Appointment'}
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Upcoming',    value: upcoming,         color: 'from-primary-500 to-indigo-600',  icon: Bell },
          { label: 'Total',       value: appts.length,     color: 'from-purple-500 to-pink-500',     icon: CalendarDays },
          { label: 'Completed',   value: completed,        color: 'from-emerald-500 to-teal-500',    icon: CheckCircle },
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

      {/* Booking form */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="card" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <h4 className="font-bold text-white mb-5">Book a New Appointment</h4>
            {elderly.length === 0 ? (
              <p className="text-slate-400 text-sm">Add elderly in "My Elderly" section first.</p>
            ) : (
              <form onSubmit={handleCreate} className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Elderly *</label>
                  <select className="input" value={form.elderly_id} onChange={e => fv('elderly_id', e.target.value)} required>
                    <option value="">— Select —</option>
                    {elderly.map(e => <option key={e.map_id} value={e.elderly?.elderly_id}>{e.elderly?.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Visit Type *</label>
                  <select className="input" value={form.visit_type} onChange={e => fv('visit_type', e.target.value)}>
                    {VISIT_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Date *</label>
                  <input type="date" className="input" value={form.date}
                    min={todayStr} onChange={e => fv('date', e.target.value)} required />
                </div>
                <div>
                  <label className="label">Time Slot *</label>
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    {TIME_SLOTS.map(t => (
                      <button key={t} type="button"
                        onClick={() => fv('time', t)}
                        className={`py-2 rounded-xl text-xs font-semibold transition-all border
                          ${form.time === t
                            ? 'bg-primary-600/40 text-primary-300 border-primary-500/50'
                            : 'glass text-slate-400 border-white/5 hover:bg-white/10'}`}
                      >{t}</button>
                    ))}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Notes</label>
                  <textarea className="input h-20 resize-none" placeholder="Any special instructions or reminders…"
                    value={form.notes} onChange={e => fv('notes', e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <button type="submit" className="btn-primary">
                    <CalendarDays className="w-4 h-4" /> Confirm Appointment
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calendar + List */}
      <div className="grid lg:grid-cols-5 gap-5">
        {/* Mini Calendar */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <ChevronLeft className="w-4 h-4 text-slate-400" />
            </button>
            <span className="font-bold text-white text-sm">{MONTHS[calMonth]} {calYear}</span>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <div className="grid grid-cols-7 mb-2">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-slate-500 py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: startOffset }, (_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: days }, (_, i) => {
              const day   = i + 1
              const ds    = `${calYear}-${String(calMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
              const isToday  = ds === todayStr
              const hasAppt  = datesWithAppt.has(ds)
              const isSel    = ds === selectedDate
              return (
                <button key={day} onClick={() => setSelectedDate(isSel ? '' : ds)}
                  className={`relative flex items-center justify-center text-xs rounded-lg py-1.5 transition-all font-medium
                    ${isSel    ? 'bg-primary-600 text-white shadow-lg'        : ''}
                    ${!isSel && isToday ? 'ring-1 ring-primary-500 text-primary-300' : ''}
                    ${!isSel && !isToday ? 'text-slate-400 hover:bg-white/10' : ''}
                  `}
                >
                  {day}
                  {hasAppt && !isSel && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400" />
                  )}
                </button>
              )
            })}
          </div>
          {selectedDate && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-xs text-slate-400 mb-2">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              {apptOnSelected.length === 0
                ? <p className="text-xs text-slate-600 italic">No appointments on this day.</p>
                : apptOnSelected.map(a => (
                  <div key={a.id} className="flex items-center gap-2 py-2 border-b border-white/5 last:border-0">
                    <Clock className="w-3.5 h-3.5 text-primary-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{a.time} – {a.elderly_name}</p>
                      <p className="text-[10px] text-slate-400">{a.visit_type}</p>
                    </div>
                    <span className={`badge text-[10px] ${STATUS_COLOR[a.status]}`}>{a.status}</span>
                  </div>
                ))
              }
            </div>
          )}
        </div>

        {/* Appointment List */}
        <div className="card lg:col-span-3">
          <h4 className="font-bold text-white mb-4 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400" />
            {selectedDate
              ? `Appointments on ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
              : 'All Appointments'}
          </h4>
          {(() => {
            const list = selectedDate ? apptOnSelected : appts
            if (list.length === 0) return (
              <div className="text-center py-14 text-slate-500">
                <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>{selectedDate ? 'No appointments on this day.' : 'No appointments yet. Book your first one!'}</p>
              </div>
            )
            return (
              <div className="space-y-3">
                {list.map((a, i) => (
                  <motion.div key={a.id}
                    initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className={`p-4 rounded-2xl bg-white/5 border transition-all
                      ${a.status === 'Completed' ? 'border-emerald-500/20 opacity-70' : 'border-white/5 hover:border-white/10'}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-600/20 flex items-center justify-center flex-shrink-0 text-lg">
                          {a.visit_type === 'Video Call' ? '📹' : a.visit_type === 'Phone Call' ? '📞' : '🏠'}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">{a.elderly_name}</p>
                          <p className="text-xs text-slate-400">{a.visit_type}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="flex items-center gap-1 text-[11px] text-slate-400">
                              <CalendarDays className="w-3 h-3" />
                              {new Date(a.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] text-slate-400">
                              <Clock className="w-3 h-3" /> {a.time}
                            </span>
                          </div>
                          {a.notes && <p className="text-[11px] text-slate-500 mt-1.5 italic">"{a.notes}"</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`badge ${STATUS_COLOR[a.status]}`}>{a.status}</span>
                        {a.status === 'Upcoming' && (
                          <button onClick={() => markDone(a.id)}
                            className="p-1.5 rounded-lg hover:bg-emerald-500/20 text-slate-500 hover:text-emerald-400 transition-colors"
                            title="Mark complete"
                          ><CheckCircle className="w-4 h-4" /></button>
                        )}
                        <button onClick={() => deleteAppt(a.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete"
                        ><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
