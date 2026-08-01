import { useEffect, useState } from 'react'
import { Users, ClipboardList, Building2, ShieldCheck, TrendingUp, Heart, BarChart2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../services/api'
import AnalyticsBoard from '../../components/AnalyticsBoard'

const StatCard = ({ icon: Icon, label, value, color, sub, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="stat-card"
  >
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <div className="text-2xl font-bold text-white">{value ?? '—'}</div>
      <div className="text-sm text-slate-400">{label}</div>
      {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
    </div>
  </motion.div>
)

const TABS = [
  { key: 'overview',  label: 'Overview',  icon: TrendingUp },
  { key: 'analytics', label: 'Analytics', icon: BarChart2 },
]

export default function AdminOverview() {
  const [stats, setStats]         = useState({})
  const [pending, setPending]     = useState([])
  const [tasks, setTasks]         = useState([])
  const [elderly, setElderly]     = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]     = useState(true)
  const [tab, setTab]             = useState('overview')

  useEffect(() => {
    Promise.all([
      api.get('/users?limit=100'),
      api.get('/tasks'),
      api.get('/homes'),
      api.get('/verification/pending'),
      api.get('/elderly'),
      api.get('/categories'),
    ]).then(([users, tasksRes, homes, verif, elderlyRes, catRes]) => {
      const t = tasksRes.data.data
      const e = elderlyRes.data.data
      setTasks(t)
      setElderly(e)
      setCategories(catRes.data.data)
      setStats({
        users:         users.data.data.length,
        tasks:         t.length,
        homes:         homes.data.data.length,
        elderly:       e.length,
        pendingVerif:  verif.data.data.length,
        completedTasks: t.filter(t => t.status === 'Completed').length,
      })
      setPending(verif.data.data.slice(0, 5))
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-white">Platform Overview</h3>
        <p className="text-slate-400 text-sm mt-1">Real-time CareCircle metrics</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 glass rounded-2xl p-1 w-fit">
        {TABS.map(t => (
          <motion.button key={t.key}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
              ${tab === t.key ? 'bg-white/15 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <t.icon className="w-4 h-4" />{t.label}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'overview' && (
          <motion.div key="ov" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard icon={Users}       label="Total Users"          value={stats.users}         color="bg-gradient-to-br from-blue-500 to-blue-700"    delay={0.00} />
              <StatCard icon={Heart}       label="Elderly Profiles"     value={stats.elderly}       color="bg-gradient-to-br from-rose-500 to-rose-700"    delay={0.05} />
              <StatCard icon={ClipboardList} label="Total Tasks" value={stats.tasks} sub={`${stats.completedTasks} completed`} color="bg-gradient-to-br from-emerald-500 to-emerald-700" delay={0.10} />
              <StatCard icon={Building2}   label="Care Homes"           value={stats.homes}         color="bg-gradient-to-br from-orange-500 to-orange-700" delay={0.15} />
              <StatCard icon={ShieldCheck} label="Pending Verification" value={stats.pendingVerif}  color="bg-gradient-to-br from-purple-500 to-purple-700" delay={0.20} />
              <StatCard icon={TrendingUp}  label="Task Completion Rate" value={stats.tasks ? `${Math.round((stats.completedTasks/stats.tasks)*100)}%` : '0%'} color="bg-gradient-to-br from-teal-500 to-teal-700" delay={0.25} />
            </div>

            {pending.length > 0 && (
              <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-400" />
                  Pending Volunteer Verifications
                </h4>
                <table className="tbl">
                  <thead><tr>
                    <th>Volunteer</th><th>Email</th><th>Document</th><th>Status</th>
                  </tr></thead>
                  <tbody>
                    {pending.map(v => (
                      <tr key={v.verification_id}>
                        <td className="font-medium text-white">{v.Volunteer?.full_name}</td>
                        <td>{v.Volunteer?.email}</td>
                        <td>{v.id_document_type || '—'}</td>
                        <td><span className="badge-yellow badge">Pending</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </motion.div>
        )}

        {tab === 'analytics' && (
          <motion.div key="an" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <AnalyticsBoard tasks={tasks} elderly={elderly} categories={categories} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
