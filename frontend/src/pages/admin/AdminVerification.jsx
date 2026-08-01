import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

export default function AdminVerification() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  const fetch = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/verification/pending')
      setList(data.data)
    } catch { toast.error('Failed to load verifications') }
    finally { setLoading(false) }
  }
  useEffect(() => { fetch() }, [])

  const updateStatus = async (id, status) => {
    setUpdating(id)
    try {
      await api.put(`/verification/${id}`, { background_check_status: status })
      toast.success(`Verification ${status}`)
      setList(l => l.filter(v => v.verification_id !== id))
    } catch { toast.error('Update failed') }
    finally { setUpdating(null) }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Verification Queue</h3>
          <p className="text-slate-400 text-sm">{list.length} pending request{list.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center h-48 items-center">
          <div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : list.length === 0 ? (
        <div className="card text-center py-14">
          <CheckCircle className="w-14 h-14 text-emerald-400 mx-auto mb-3" />
          <p className="text-lg font-semibold text-white">All caught up!</p>
          <p className="text-slate-400 text-sm mt-1">No pending verification requests</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {list.map(v => (
            <div key={v.verification_id} className="card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-300 font-bold text-lg flex-shrink-0">
                    {v.Volunteer?.full_name?.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{v.Volunteer?.full_name}</div>
                    <div className="text-sm text-slate-400">{v.Volunteer?.email}</div>
                    <div className="text-sm text-slate-400">{v.Volunteer?.phone || '—'}</div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {v.id_document_type && (
                        <span className="flex items-center gap-1 text-xs text-slate-400 bg-white/5 px-2 py-1 rounded-lg">
                          <FileText className="w-3 h-3" />{v.id_document_type}
                        </span>
                      )}
                      {v.id_proof_number && (
                        <span className="text-xs text-slate-400 bg-white/5 px-2 py-1 rounded-lg font-mono">{v.id_proof_number}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 sm:flex-col sm:items-end">
                  <button id={`approve-${v.verification_id}`}
                    onClick={() => updateStatus(v.verification_id, 'Approved')}
                    disabled={updating === v.verification_id}
                    className="btn-success text-xs px-4 py-2">
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                  <button id={`reject-${v.verification_id}`}
                    onClick={() => updateStatus(v.verification_id, 'Rejected')}
                    disabled={updating === v.verification_id}
                    className="btn-danger text-xs px-4 py-2">
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
