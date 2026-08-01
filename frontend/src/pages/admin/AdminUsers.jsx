import { useEffect, useState } from 'react'
import { Search, UserCheck, UserX, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

const badgeForStatus = s => s === 'Active' ? 'badge-green' : s === 'Blocked' ? 'badge-red' : 'badge-gray'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [updating, setUpdating] = useState(null)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/users?limit=100${roleFilter ? `&role=${roleFilter}` : ''}`)
      setUsers(data.data)
    } catch { toast.error('Failed to load users') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers() }, [roleFilter])

  const toggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Blocked' : 'Active'
    setUpdating(userId)
    try {
      await api.put(`/users/${userId}/status`, { status: newStatus })
      toast.success(`User ${newStatus === 'Active' ? 'unblocked' : 'blocked'}`)
      setUsers(u => u.map(usr => usr.user_id === userId ? {...usr, status: newStatus} : usr))
    } catch { toast.error('Failed to update status') }
    finally { setUpdating(null) }
  }

  const filtered = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input className="input pl-10" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select id="role-filter" className="input sm:w-48" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Family">Family</option>
          <option value="Volunteer">Volunteer</option>
        </select>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : (
          <table className="tbl">
            <thead><tr>
              <th>User</th><th>Email</th><th>Phone</th><th>Role(s)</th><th>Status</th><th>Joined</th><th>Action</th>
            </tr></thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.user_id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary-600/30 flex items-center justify-center text-primary-300 text-sm font-bold flex-shrink-0">
                        {u.full_name.charAt(0)}
                      </div>
                      <span className="font-medium text-white">{u.full_name}</span>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>{u.phone || '—'}</td>
                  <td>{u.roles.map(r => <span key={r} className={`badge mr-1 ${r === 'Admin' ? 'badge-blue' : r === 'Family' ? 'badge-red' : 'badge-green'}`}>{r}</span>)}</td>
                  <td><span className={`badge ${badgeForStatus(u.status)}`}>{u.status}</span></td>
                  <td>{new Date(u.created_at).toLocaleDateString('en-IN')}</td>
                  <td>
                    {!u.roles.includes('Admin') && (
                      <button id={`toggle-${u.user_id}`}
                        onClick={() => toggleStatus(u.user_id, u.status)}
                        disabled={updating === u.user_id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                          ${u.status === 'Active'
                            ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'}`}>
                        {u.status === 'Active' ? <><UserX className="w-3.5 h-3.5" />Block</> : <><UserCheck className="w-3.5 h-3.5" />Unblock</>}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="text-center py-10 text-slate-500">No users found</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
