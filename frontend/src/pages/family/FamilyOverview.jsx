import { useEffect, useState } from 'react'
import { Heart, ClipboardList, Clock, CheckCircle, ArrowRight, BarChart2, Map } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import AnalyticsBoard from '../../components/AnalyticsBoard'
import ElderlyMap from '../../components/ElderlyMap'

const statusColor = { Pending: 'badge-yellow', Assigned: 'badge-blue', Completed: 'badge-green', Cancelled: 'badge-red' }

const TABS = [
  { key: 'overview', label: 'Overview',  icon: Heart },
  { key: 'map',      label: 'Map View',  icon: Map },
  { key: 'analytics',label: 'Analytics', icon: BarChart2 },
]

export default function FamilyOverview() {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const [tab, setTab]     = useState('overview')
  const [elderly, setElderly] = useState([])
  const [tasks, setTasks]     = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/family-map/my-elderly'),
      api.get('/tasks'),
      api.get('/categories'),
    ]).then(([e, t, c]) => {
      setElderly(e.data.data)
      setTasks(t.data.data)
      setCategories(c.data.data)
    }).finally(() => setLoading(false))
  }, [])

  const pendingTasks   = tasks.filter(t => t.status === 'Pending').length
  const completedTasks = tasks.filter(t => t.status === 'Completed').length

  if (loading) return (
    <div className="flex justify-center h-64 items-center">
      <div className="w-10 h-10 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h3 className="text-2xl font-bold text-white">
          Welcome back, <span className="gradient-text">{user?.full_name?.split(' ')[0]}</span>!
        </h3>
        <p className="text-slate-400 text-sm mt-1">Here's what's happening with your care circle.</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 glass rounded-2xl p-1 w-fit">
        {TABS.map(t => (
          <motion.button key={t.key}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
              ${tab === t.key
                ? 'bg-white/15 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'}`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Elderly Registered', value: elderly.length,   icon: Heart,         color: 'from-rose-500 to-rose-700' },
                { label: 'Total Tasks',         value: tasks.length,     icon: ClipboardList, color: 'from-blue-500 to-blue-700' },
                { label: 'Pending Tasks',       value: pendingTasks,     icon: Clock,         color: 'from-yellow-500 to-orange-600' },
                { label: 'Completed',           value: completedTasks,   icon: CheckCircle,   color: 'from-emerald-500 to-emerald-700' },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  className="stat-card"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0`}>
                    <s.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{s.value}</div>
                    <div className="text-xs text-slate-400">{s.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Elderly list */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-white flex items-center gap-2"><Heart className="w-4 h-4 text-rose-400" />Your Elderly</h4>
                  <button onClick={() => navigate('/family/elderly')} className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
                    View all <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                {elderly.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">
                    <Heart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p>No elderly registered yet</p>
                    <button onClick={() => navigate('/family/elderly')} className="btn-primary text-xs mt-3">Register Elderly</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {elderly.slice(0, 4).map(e => (
                      <motion.div key={e.map_id} whileHover={{ x: 4 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 cursor-default"
                      >
                        <div className="w-10 h-10 rounded-full bg-rose-600/20 flex items-center justify-center text-rose-300 font-bold">
                          {e.elderly?.name?.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">{e.elderly?.name}</div>
                          <div className="text-xs text-slate-400">{e.relation_type} · Age {e.elderly?.age}</div>
                        </div>
                        <span className={`badge ${e.elderly?.living_type === 'Home' ? 'badge-blue' : 'badge-purple'}`}>
                          {e.elderly?.living_type}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent tasks */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-white flex items-center gap-2"><ClipboardList className="w-4 h-4 text-blue-400" />Recent Tasks</h4>
                  <button onClick={() => navigate('/family/tasks')} className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
                    View all <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                {tasks.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">No tasks created yet</div>
                ) : (
                  <div className="space-y-3">
                    {tasks.slice(0, 5).map(t => (
                      <div key={t.task_id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">{t.Elderly_Profiles?.name}</div>
                          <div className="text-xs text-slate-400">
                            {t.Task_Categories?.category_name} · {new Date(t.task_date).toLocaleDateString('en-IN')}
                          </div>
                        </div>
                        <span className={`badge ${statusColor[t.status]}`}>{t.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {tab === 'map' && (
          <motion.div key="map" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="card p-0 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <Map className="w-4 h-4 text-blue-400" /> Elderly Location Map
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">Geographic view of your elderly care circle</p>
                </div>
                <div className="flex gap-3 text-xs">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />Home</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />Care Home</span>
                </div>
              </div>
              <div className="p-4">
                {elderly.length === 0 ? (
                  <div className="flex items-center justify-center h-64 text-slate-500 flex-col gap-2">
                    <Map className="w-10 h-10 opacity-30" />
                    <p>No elderly registered yet. Add them to see the map.</p>
                  </div>
                ) : (
                  <ElderlyMap elderly={elderly} />
                )}
              </div>
            </div>
          </motion.div>
        )}

        {tab === 'analytics' && (
          <motion.div key="analytics" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <AnalyticsBoard tasks={tasks} elderly={elderly} categories={categories} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
