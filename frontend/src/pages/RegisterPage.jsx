import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Lock, UserPlus, Heart } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const roles = [
  { value: 'Family', label: 'Family Member', desc: 'Register & manage elderly relatives' },
  { value: 'Volunteer', label: 'Volunteer', desc: 'Help elderly with daily tasks' },
  { value: 'Admin', label: 'Administrator', desc: 'Manage platform operations' },
]

export default function RegisterPage() {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', role: 'Family' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', form)
      login(data.data.token, data.data.user)
      toast.success('Account created successfully!')
      const role = data.data.user.roles[0]
      if (role === 'Admin') navigate('/admin')
      else if (role === 'Family') navigate('/family')
      else navigate('/volunteer')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-10 relative overflow-hidden"
         style={{background:'linear-gradient(135deg,#0a0f1e 0%,#111432 50%,#0f1629 100%)'}}>
      <div className="absolute top-20 right-20 w-72 h-72 bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-700/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg px-4 animate-fadein">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 shadow-lg shadow-primary-900/50 mb-4 glow">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">CareCircle</h1>
          <p className="text-slate-400 text-sm mt-1">Join the care community</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-white mb-6">Create your account</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role selection */}
            <div>
              <label className="label">I am a...</label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map(r => (
                  <button key={r.value} type="button" id={`role-${r.value.toLowerCase()}`}
                    onClick={() => set('role', r.value)}
                    className={`p-3 rounded-xl border text-left transition-all duration-150 ${
                      form.role === r.value
                        ? 'border-primary-500 bg-primary-600/20 text-primary-300'
                        : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-300'
                    }`}>
                    <div className="text-xs font-semibold">{r.label}</div>
                    <div className="text-[10px] mt-0.5 opacity-70">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input id="full-name" type="text" className="input pl-10" placeholder="Arjun Sharma"
                  value={form.full_name} onChange={e => set('full_name', e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input id="email" type="email" className="input pl-10" placeholder="you@example.com"
                    value={form.email} onChange={e => set('email', e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="label">Phone (optional)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input id="phone" type="tel" className="input pl-10" placeholder="9999000000"
                    value={form.phone} onChange={e => set('phone', e.target.value)} />
                </div>
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input id="password" type="password" className="input pl-10" placeholder="Min. 8 characters"
                  value={form.password} onChange={e => set('password', e.target.value)} required minLength={8} />
              </div>
            </div>

            <button id="register-btn" type="submit" className="btn-primary w-full justify-center" disabled={loading}>
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/10 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
