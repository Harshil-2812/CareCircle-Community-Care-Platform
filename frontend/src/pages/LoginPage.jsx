import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, LogIn, Heart } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      login(data.data.token, data.data.user)
      toast.success(`Welcome back, ${data.data.user.full_name}!`)
      const role = data.data.user.roles[0]
      if (role === 'Admin') navigate('/admin')
      else if (role === 'Family') navigate('/family')
      else navigate('/volunteer')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{background:'linear-gradient(135deg,#0a0f1e 0%,#111432 50%,#0f1629 100%)'}}>
      {/* Background blobs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-700/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-4 animate-fadein">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 shadow-lg shadow-primary-900/50 mb-4 glow">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">CareCircle</h1>
          <p className="text-slate-400 text-sm mt-1">Compassionate care, connected.</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-white mb-6">Sign in to your account</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input id="email" type="email" className="input pl-10" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} required />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input id="password" type="password" className="input pl-10" placeholder="••••••••"
                  value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} required />
              </div>
            </div>
            <button id="login-btn" type="submit" className="btn-primary w-full justify-center" disabled={loading}>
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <LogIn className="w-4 h-4" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/10 text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">Create one</Link>
          </div>

          {/* Demo credentials */}
          <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-slate-400 font-semibold mb-2 uppercase tracking-wide">Demo Credentials</p>
            <div className="space-y-1 text-xs text-slate-500">
              <div><span className="text-slate-400">Admin:</span> admin@carecircle.com / Password@123</div>
              <div><span className="text-slate-400">Family:</span> priya.mehta@email.com / Password@123</div>
              <div><span className="text-slate-400">Volunteer:</span> vikram.singh@email.com / Password@123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
