import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { motion } from 'framer-motion'
import { BarChart2, PieChart as PieIcon, TrendingUp, ClipboardList, CheckCircle, Clock, Heart } from 'lucide-react'

const PALETTE = {
  Assigned:  '#6089ff',
  Pending:   '#f97316',
  Completed: '#10b981',
  Cancelled: '#f43f5e',
}
const COLORS = ['#6089ff', '#f43f5e', '#10b981', '#f97316', '#a855f7', '#06b6d4']

/* ── Custom tooltip ── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(10,15,30,0.95)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 12,
      padding: '10px 14px',
      fontSize: 12,
      boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
    }}>
      {label && <p style={{ color: '#94a3b8', marginBottom: 6 }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill, fontWeight: 700, marginBottom: 2 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

/* ── Donut with center label ── */
function DonutChart({ data, colors, height = 200 }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  return (
    <div style={{ position: 'relative', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data} cx="50%" cy="50%"
            innerRadius={height * 0.3} outerRadius={height * 0.44}
            paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]}
                stroke="rgba(10,15,30,0.8)" strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      {/* Center label */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <span style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>{total}</span>
        <span style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>total</span>
      </div>
    </div>
  )
}

/* ── Color Legend Row ── */
function LegendRow({ items, colors }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', justifyContent: 'center', marginTop: 12 }}>
      {items.map((item, i) => (
        <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: colors[i % colors.length], flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: '#94a3b8' }}>{item.name}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>{item.value}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Section Title ── */
function SectionTitle({ icon: Icon, label, color }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <h4 className="font-bold text-white text-sm">{label}</h4>
    </div>
  )
}

/* ── Gradient Bar with custom shape ── */
const RoundedBar = (props) => {
  const { x, y, width, height, fill } = props
  if (!height || height <= 0) return null
  const r = Math.min(6, width / 2)
  return (
    <g>
      <defs>
        <linearGradient id={`grad-${fill}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity={1} />
          <stop offset="100%" stopColor={fill} stopOpacity={0.4} />
        </linearGradient>
      </defs>
      <rect x={x} y={y} width={width} height={height} rx={r} ry={r}
        fill={`url(#grad-${fill})`} />
    </g>
  )
}

export default function AnalyticsBoard({ tasks, elderly, categories }) {
  /* ── data derivations ── */
  const statusData = ['Pending', 'Assigned', 'Completed', 'Cancelled']
    .map(s => ({ name: s, value: tasks.filter(t => t.status === s).length }))
    .filter(d => d.value > 0)
  const statusColors = statusData.map(d => PALETTE[d.name] || '#6089ff')

  const catData = categories
    .map(c => ({ name: c.category_name, Tasks: tasks.filter(t => t.category_id === c.category_id).length }))
    .filter(d => d.Tasks > 0)
    .sort((a, b) => b.Tasks - a.Tasks)

  const weeklyData = (() => {
    const acc = {}
    tasks.forEach(t => {
      if (!t.task_date) return
      const d = new Date(t.task_date)
      const ws = new Date(d); ws.setDate(d.getDate() - d.getDay())
      const key = ws.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
      if (!acc[key]) acc[key] = { week: key, Created: 0, Completed: 0 }
      acc[key].Created++
      if (t.status === 'Completed') acc[key].Completed++
    })
    return Object.values(acc).slice(-8)
  })()

  const livingData = [
    { name: 'Home',      value: elderly.filter(e => e.elderly?.living_type === 'Home').length },
    { name: 'Care Home', value: elderly.filter(e => e.elderly?.living_type === 'Care_Home').length },
  ].filter(d => d.value > 0)
  const livingColors = ['#6089ff', '#f43f5e']

  const completedCount = tasks.filter(t => t.status === 'Completed').length
  const activeCount    = tasks.filter(t => ['Pending','Assigned'].includes(t.status)).length
  const rate           = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0

  const pills = [
    { label: 'Total Tasks',     value: tasks.length,   icon: ClipboardList, color: 'from-blue-500 to-indigo-600' },
    { label: 'Active',          value: activeCount,    icon: Clock,         color: 'from-orange-500 to-amber-500' },
    { label: 'Completed',       value: completedCount, icon: CheckCircle,   color: 'from-emerald-500 to-teal-500' },
    { label: 'Completion Rate', value: `${rate}%`,     icon: TrendingUp,    color: 'from-purple-500 to-pink-500' },
  ]

  if (tasks.length === 0 && elderly.length === 0) return (
    <div className="card text-center py-20 text-slate-500">
      <BarChart2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p>No data yet. Create tasks and add elderly to see analytics.</p>
    </div>
  )

  return (
    <div className="space-y-5">
      {/* KPI pills */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {pills.map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="stat-card"
          >
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-slate-400">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Row 1: Status Donut + Category Bars */}
      <div className="grid lg:grid-cols-2 gap-5">

        {/* Status donut — clean, no overlapping labels */}
        <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <SectionTitle icon={PieIcon} label="Task Status Breakdown" color="bg-gradient-to-br from-primary-500 to-indigo-600" />
          {statusData.length === 0
            ? <p className="text-slate-500 text-sm text-center py-10">No task data</p>
            : <>
                <DonutChart data={statusData} colors={statusColors} height={200} />
                <LegendRow items={statusData} colors={statusColors} />
              </>
          }
        </motion.div>

        {/* Category bars — gradient fill, rounded tops */}
        <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <SectionTitle icon={BarChart2} label="Tasks by Category" color="bg-gradient-to-br from-emerald-500 to-teal-600" />
          {catData.length === 0
            ? <p className="text-slate-500 text-sm text-center py-10">No category data</p>
            : <ResponsiveContainer width="100%" height={240}>
                <BarChart data={catData} margin={{ top: 4, right: 8, bottom: 28, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false}
                    angle={-25} textAnchor="end" interval={0} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} width={20} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="Tasks" shape={<RoundedBar fill="#6089ff" />}>
                    {catData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
          }
        </motion.div>
      </div>

      {/* Row 2: Weekly line + Elderly donut */}
      <div className="grid lg:grid-cols-3 gap-5">

        <motion.div className="card lg:col-span-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <SectionTitle icon={TrendingUp} label="Weekly Task Activity" color="bg-gradient-to-br from-orange-500 to-rose-500" />
          {weeklyData.length === 0
            ? <p className="text-slate-500 text-sm text-center py-10">Not enough data yet</p>
            : <ResponsiveContainer width="100%" height={210}>
                <LineChart data={weeklyData} margin={{ top: 4, right: 10, bottom: 4, left: -10 }}>
                  <defs>
                    <linearGradient id="lineGrad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6089ff" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6089ff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="lineGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal vertical={false} />
                  <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} width={20} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={v => <span style={{ color: '#94a3b8', fontSize: 11 }}>{v}</span>} />
                  <Line type="monotone" dataKey="Created"   stroke="#6089ff" strokeWidth={2.5}
                    dot={{ fill: '#6089ff', r: 4, stroke: '#0a0f1e', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Completed" stroke="#10b981" strokeWidth={2.5}
                    dot={{ fill: '#10b981', r: 4, stroke: '#0a0f1e', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
          }
        </motion.div>

        <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          <SectionTitle icon={Heart} label="Living Arrangement" color="bg-gradient-to-br from-rose-500 to-pink-600" />
          {livingData.length === 0
            ? <p className="text-slate-500 text-sm text-center py-10">No elderly data</p>
            : <>
                <DonutChart data={livingData} colors={livingColors} height={180} />
                <LegendRow items={livingData} colors={livingColors} />
              </>
          }
        </motion.div>
      </div>
    </div>
  )
}
