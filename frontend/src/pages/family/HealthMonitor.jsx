import { useEffect, useState } from 'react'
import { Activity, Heart, Droplets, Thermometer, Plus, X, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../../services/api'

const VITAL_TYPES = [
  { key: 'heart_rate',    label: 'Heart Rate',      unit: 'bpm',   icon: Heart,        color: '#f43f5e', normal: [60, 100] },
  { key: 'systolic_bp',  label: 'Systolic BP',     unit: 'mmHg',  icon: Activity,     color: '#6089ff', normal: [90, 130] },
  { key: 'diastolic_bp', label: 'Diastolic BP',    unit: 'mmHg',  icon: Activity,     color: '#a855f7', normal: [60, 85]  },
  { key: 'glucose',      label: 'Blood Glucose',   unit: 'mg/dL', icon: Droplets,     color: '#f97316', normal: [70, 140] },
  { key: 'temperature',  label: 'Body Temperature', unit: '°C',  icon: Thermometer,  color: '#10b981', normal: [36, 37.5]},
  { key: 'spo2',         label: 'Blood Oxygen',    unit: '%',     icon: Activity,     color: '#06b6d4', normal: [95, 100] },
]

const STORAGE_KEY = 'cc_health_vitals'

// Generate demo data seeded by elderly_id
function generateDemoVitals(elderlyId, days = 14) {
  const entries = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const date = d.toISOString().split('T')[0]
    if (elderlyId === 1) {
      // Patient One: Hypertension patient — systolic occasionally high
      entries.push({
        date,
        heart_rate:   72 + Math.round(Math.sin(i) * 8),
        systolic_bp:  128 + Math.round(Math.sin(i * 0.7) * 12),
        diastolic_bp: 82 + Math.round(Math.cos(i * 0.5) * 6),
        glucose:      95 + Math.round(Math.cos(i) * 15),
        temperature:  36.6 + parseFloat((Math.sin(i * 0.3) * 0.4).toFixed(1)),
        spo2:         97 + Math.round(Math.cos(i * 0.4)),
      })
    } else {
      // Patient Two: Diabetic — glucose swings
      entries.push({
        date,
        heart_rate:   78 + Math.round(Math.cos(i) * 6),
        systolic_bp:  118 + Math.round(Math.sin(i * 0.6) * 8),
        diastolic_bp: 76 + Math.round(Math.sin(i * 0.4) * 5),
        glucose:      130 + Math.round(Math.sin(i * 1.2) * 35),
        temperature:  36.8 + parseFloat((Math.cos(i * 0.5) * 0.3).toFixed(1)),
        spo2:         96 + Math.round(Math.sin(i * 0.3)),
      })
    }
  }
  return entries
}

function loadVitals(elderlyIdList) {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    // Auto-seed demo data for first two patients if not already stored
    elderlyIdList.forEach((id, idx) => {
      if (!stored[id]) stored[id] = generateDemoVitals(idx + 1)
    })
    if (elderlyIdList.length > 0) localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
    return stored
  } catch { return {} }
}
function saveVitals(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function trendIcon(data, key) {
  if (data.length < 2) return <Minus className="w-3.5 h-3.5 text-slate-400" />
  const last = data[data.length - 1][key]
  const prev = data[data.length - 2][key]
  if (last > prev) return <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
  if (last < prev) return <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
  return <Minus className="w-3.5 h-3.5 text-slate-400" />
}

function isAbnormal(val, normal) {
  return val < normal[0] || val > normal[1]
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl p-3 text-xs border border-white/10 shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="font-semibold" style={{ color: p.color }}>
          {p.value} {p.unit}
        </p>
      ))}
    </div>
  )
}

export default function HealthMonitor() {
  const [elderly, setElderly]       = useState([])
  const [selected, setSelected]     = useState(null)
  const [vitals, setVitals]         = useState({}) // { elderlyId: [{ date, heart_rate, ... }] }
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [activeVital, setActiveVital] = useState(VITAL_TYPES[0].key)
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    heart_rate: '', systolic_bp: '', diastolic_bp: '',
    glucose: '', temperature: '', spo2: '',
  })

  useEffect(() => {
    api.get('/family-map/my-elderly')
      .then(r => {
        const list = r.data.data
        setElderly(list)
        if (list.length > 0) setSelected(list[0])
        // Seed demo vitals keyed to real elderly IDs
        const ids = list.map(e => e.elderly?.elderly_id).filter(Boolean)
        setVitals(loadVitals(ids))
      })
      .catch(() => toast.error('Failed to load elderly list'))
      .finally(() => setLoading(false))
  }, [])

  const currentId   = selected?.elderly?.elderly_id
  const currentData = currentId ? (vitals[currentId] || []) : []

  const handleLog = (e) => {
    e.preventDefault()
    const entry = {
      date: form.date,
      heart_rate:    form.heart_rate    ? Number(form.heart_rate)    : null,
      systolic_bp:   form.systolic_bp   ? Number(form.systolic_bp)   : null,
      diastolic_bp:  form.diastolic_bp  ? Number(form.diastolic_bp)  : null,
      glucose:       form.glucose       ? Number(form.glucose)       : null,
      temperature:   form.temperature   ? Number(form.temperature)   : null,
      spo2:          form.spo2          ? Number(form.spo2)          : null,
    }
    const updated = {
      ...vitals,
      [currentId]: [...(vitals[currentId] || []), entry].sort((a,b) => a.date.localeCompare(b.date))
    }
    setVitals(updated)
    saveVitals(updated)
    toast.success('Vitals logged!')
    setShowForm(false)
    setForm({ date: new Date().toISOString().split('T')[0], heart_rate:'', systolic_bp:'', diastolic_bp:'', glucose:'', temperature:'', spo2:'' })
  }

  const activeType = VITAL_TYPES.find(v => v.key === activeVital)
  const chartData  = currentData.filter(d => d[activeVital] !== null && d[activeVital] !== undefined)

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-rose-400" />
            Health Monitor
          </h3>
          <p className="text-slate-400 text-sm mt-1">Track and visualize vital signs for your elderly.</p>
        </div>
        {selected && (
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => setShowForm(v => !v)}
            className={`btn-primary text-sm ${showForm ? 'opacity-70' : ''}`}
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Cancel' : 'Log Vitals'}
          </motion.button>
        )}
      </div>

      {/* Patient Selector */}
      {elderly.length === 0 ? (
        <div className="card text-center py-14 text-slate-500">
          <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No elderly linked. Add elderly from the "My Elderly" section first.</p>
        </div>
      ) : (
        <div className="flex gap-3 flex-wrap">
          {elderly.map(e => (
            <motion.button
              key={e.map_id}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setSelected(e)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all border
                ${selected?.map_id === e.map_id
                  ? 'bg-rose-600/30 text-rose-300 border-rose-500/40'
                  : 'glass text-slate-300 border-white/5 hover:bg-white/10'}`}
            >
              <div className="w-7 h-7 rounded-full bg-rose-600/20 flex items-center justify-center text-rose-300 font-bold text-xs">
                {e.elderly?.name?.charAt(0)}
              </div>
              {e.elderly?.name}
            </motion.button>
          ))}
        </div>
      )}

      {/* Log Form */}
      <AnimatePresence>
        {showForm && selected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="card"
          >
            <h4 className="font-bold text-white mb-4">Log Vitals for {selected.elderly?.name}</h4>
            <form onSubmit={handleLog} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="col-span-full">
                <label className="label">Date</label>
                <input type="date" className="input" value={form.date}
                  onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
              </div>
              {VITAL_TYPES.map(v => (
                <div key={v.key}>
                  <label className="label">{v.label} ({v.unit})</label>
                  <input type="number" step="0.1" className="input" placeholder={`${v.normal[0]}–${v.normal[1]}`}
                    value={form[v.key]}
                    onChange={e => setForm(p => ({ ...p, [v.key]: e.target.value }))}
                  />
                </div>
              ))}
              <div className="col-span-full">
                <button type="submit" className="btn-primary">
                  <Plus className="w-4 h-4" /> Save Entry
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Reading Cards */}
      {selected && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {VITAL_TYPES.map(v => {
              const last = [...currentData].reverse().find(d => d[v.key] !== null && d[v.key] !== undefined)
              const val  = last?.[v.key]
              const abnormal = val !== undefined && isAbnormal(val, v.normal)
              return (
                <motion.button
                  key={v.key}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={() => setActiveVital(v.key)}
                  className={`glass rounded-2xl p-4 text-left transition-all border
                    ${activeVital === v.key
                      ? 'border-opacity-60 ring-1'
                      : 'border-white/5 hover:border-white/15'}`}
                  style={activeVital === v.key ? { borderColor: v.color, '--tw-ring-color': v.color } : {}}
                >
                  <div className="flex items-center justify-between mb-2">
                    <v.icon className="w-4 h-4" style={{ color: v.color }} />
                    {trendIcon(currentData.filter(d => d[v.key] != null), v.key)}
                  </div>
                  <div className={`text-xl font-bold ${abnormal ? 'text-rose-400' : 'text-white'}`}>
                    {val ?? '—'}
                    {val !== undefined && <span className="text-xs font-normal text-slate-400 ml-1">{v.unit}</span>}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-tight">{v.label}</div>
                  {abnormal && <div className="text-[9px] text-rose-400 font-semibold mt-1 uppercase tracking-wide">⚠ Out of range</div>}
                </motion.button>
              )
            })}
          </div>

          {/* Chart */}
          <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={activeVital}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="font-bold text-white">{activeType?.label} Trend</h4>
                <p className="text-xs text-slate-400">Normal range: {activeType?.normal[0]}–{activeType?.normal[1]} {activeType?.unit}</p>
              </div>
              <span className="badge badge-blue">{chartData.length} readings</span>
            </div>

            {chartData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-slate-500 flex-col gap-2">
                <Activity className="w-8 h-8 opacity-30" />
                <p className="text-sm">No data logged yet for {activeType?.label}.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={activeType.normal[0]} stroke="rgba(16,185,129,0.3)" strokeDasharray="4 4"
                    label={{ value: `Min ${activeType.normal[0]}`, fill: '#6ee7b7', fontSize: 10, position: 'insideLeft' }} />
                  <ReferenceLine y={activeType.normal[1]} stroke="rgba(239,68,68,0.3)" strokeDasharray="4 4"
                    label={{ value: `Max ${activeType.normal[1]}`, fill: '#fca5a5', fontSize: 10, position: 'insideLeft' }} />
                  <Line
                    type="monotone" dataKey={activeVital}
                    stroke={activeType.color} strokeWidth={2.5}
                    dot={{ fill: activeType.color, r: 4, strokeWidth: 2, stroke: '#0a0f1e' }}
                    activeDot={{ r: 6 }} animationDuration={600}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* History Table */}
          {currentData.length > 0 && (
            <div className="card p-0 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5">
                <h4 className="font-bold text-white">Full History for {selected.elderly?.name}</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="tbl">
                  <thead><tr>
                    <th>Date</th>
                    {VITAL_TYPES.map(v => <th key={v.key}>{v.label} ({v.unit})</th>)}
                  </tr></thead>
                  <tbody>
                    {[...currentData].reverse().map((row, i) => (
                      <tr key={i}>
                        <td className="font-medium text-white">{row.date}</td>
                        {VITAL_TYPES.map(v => {
                          const val = row[v.key]
                          const ab  = val !== undefined && val !== null && isAbnormal(val, v.normal)
                          return (
                            <td key={v.key} className={ab ? 'text-rose-400 font-semibold' : ''}>
                              {val ?? <span className="text-slate-600">—</span>}
                              {ab && ' ⚠'}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
