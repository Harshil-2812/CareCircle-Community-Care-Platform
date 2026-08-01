import { useEffect, useState } from 'react'
import { ShieldCheck, FileText, Clock, CheckCircle, XCircle, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

const statusIcon = {
  Approved: <CheckCircle className="w-5 h-5 text-emerald-400" />,
  Pending:  <Clock className="w-5 h-5 text-yellow-400" />,
  Rejected: <XCircle className="w-5 h-5 text-rose-400" />,
}
const statusBadge = { Approved: 'badge-green', Pending: 'badge-yellow', Rejected: 'badge-red' }

export default function VolunteerVerification() {
  const [verif, setVerif] = useState(undefined)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ id_document_type: 'Aadhaar Card', id_proof_number: '' })
  const [saving, setSaving] = useState(false)

  const fetchStatus = async () => {
    setLoading(true)
    try { const { data } = await api.get('/verification/status'); setVerif(data.data) }
    catch { toast.error('Failed to load verification status') }
    finally { setLoading(false) }
  }
  useEffect(() => { fetchStatus() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await api.post('/verification', form)
      toast.success('Verification submitted! Awaiting admin review.'); fetchStatus()
    } catch (err) { toast.error(err.response?.data?.message || 'Submission failed') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center h-64 items-center"><div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" /></div>

  return (
    <div className="space-y-5 max-w-xl">
      <div>
        <h3 className="text-xl font-bold text-white">Background Verification</h3>
        <p className="text-slate-400 text-sm mt-1">Required before accepting any tasks.</p>
      </div>

      {verif ? (
        <div className="card space-y-6">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
              verif.background_check_status === 'Approved' ? 'bg-emerald-600/20' :
              verif.background_check_status === 'Pending' ? 'bg-yellow-600/20' : 'bg-rose-600/20'
            }`}>
              {statusIcon[verif.background_check_status]}
            </div>
            <div>
              <div className="text-lg font-bold text-white">Verification {verif.background_check_status}</div>
              <span className={`badge ${statusBadge[verif.background_check_status]}`}>{verif.background_check_status}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white/5 rounded-xl p-3">
              <div className="text-xs text-slate-500 mb-1">Document Type</div>
              <div className="text-slate-200 font-medium">{verif.id_document_type || '—'}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <div className="text-xs text-slate-500 mb-1">Document Number</div>
              <div className="text-slate-200 font-medium font-mono">{verif.id_proof_number || '—'}</div>
            </div>
          </div>

          {verif.background_check_status === 'Pending' && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <div className="flex items-center gap-2 text-yellow-300 font-semibold text-sm mb-1">
                <Clock className="w-4 h-4" /> Under Review
              </div>
              <p className="text-xs text-yellow-400/70">An admin will review your documents shortly. You'll be able to accept tasks once approved.</p>
            </div>
          )}

          {verif.background_check_status === 'Approved' && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm mb-1">
                <CheckCircle className="w-4 h-4" /> Approved!
              </div>
              <p className="text-xs text-emerald-400/70">You're verified and can now accept tasks. Make sure to add your availability slots!</p>
            </div>
          )}

          {verif.background_check_status === 'Rejected' && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              <div className="flex items-center gap-2 text-rose-300 font-semibold text-sm mb-1">
                <XCircle className="w-4 h-4" /> Rejected
              </div>
              <p className="text-xs text-rose-400/70">Your verification was rejected. Please contact support for more information.</p>
            </div>
          )}

          {verif.Verifier && (
            <div className="text-xs text-slate-500">
              Reviewed by {verif.Verifier.full_name} · {verif.verified_at ? new Date(verif.verified_at).toLocaleDateString('en-IN') : ''}
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <div className="font-semibold text-white">Submit Verification Documents</div>
              <div className="text-xs text-slate-400">Your information is kept secure and confidential.</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Document Type *</label>
              <select id="doc-type" className="input" value={form.id_document_type} onChange={e=>setForm(p=>({...p,id_document_type:e.target.value}))}>
                <option>Aadhaar Card</option>
                <option>PAN Card</option>
                <option>Passport</option>
                <option>Driving License</option>
                <option>Voter ID</option>
              </select>
            </div>
            <div>
              <label className="label">Document Number *</label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input id="doc-number" className="input pl-10" placeholder="Enter document number" value={form.id_proof_number}
                  onChange={e=>setForm(p=>({...p,id_proof_number:e.target.value}))} required />
              </div>
            </div>
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-300">
              ℹ️ Submit your government-issued ID for background verification. Admin review typically takes 1-2 business days.
            </div>
            <button id="submit-verif-btn" type="submit" className="btn-primary w-full justify-center" disabled={saving}>
              {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
              Submit for Verification
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
