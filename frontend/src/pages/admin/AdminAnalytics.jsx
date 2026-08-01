import { useState, useEffect } from 'react'
import api from '../../services/api'
import { ServerCrash, Loader2 } from 'lucide-react'

export default function AdminAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const safeGet = (promise) => promise.then(r => r.data?.data ?? []).catch(() => [])

        const [assignments, occupancy, networks, urgent, topVolunteers, verificationLog] = await Promise.all([
          safeGet(api.get('/assignments/analytics/volunteer-tasks')),
          safeGet(api.get('/homes/analytics/occupancy')),
          safeGet(api.get('/networks/analytics/residents')),
          safeGet(api.get('/tasks/analytics/urgent')),
          safeGet(api.get('/users/analytics/top-volunteers')),
          safeGet(api.get('/verification/analytics/admin-log'))
        ])

        setData({ assignments, occupancy, networks, urgent, topVolunteers, verificationLog })
      } catch (err) {
        console.error(err)
        setError('Failed to load raw analytics. Check backend connections.')
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
    </div>
  )

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 text-red-500 space-y-4">
      <ServerCrash className="h-12 w-12" />
      <p>{error}</p>
    </div>
  )

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Raw SQL Analytics</h2>
        <span className="px-3 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400 rounded-full text-sm font-medium">
          Live Database Feed
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Top Volunteers */}
        <div className="col-span-1 border border-primary-200 dark:border-primary-800 shadow-sm rounded-lg overflow-hidden bg-white dark:bg-gray-900">
          <div className="px-4 py-3 border-b dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Top Volunteer Leaderboard</h3>
          </div>
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="px-4 py-2">Volunteer</th>
                    <th className="px-4 py-2">Completed Tasks</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.topVolunteers?.map((v, i) => (
                    <tr key={i} className="border-b dark:border-gray-800 text-gray-800 dark:text-gray-200">
                      <td className="px-4 py-2 font-medium">{v.volunteer_name}</td>
                      <td className="px-4 py-2">{v.completed_tasks}</td>
                    </tr>
                  ))}
                  {!data?.topVolunteers?.length && <tr><td colSpan="2" className="px-4 py-4 text-center text-gray-500">No data found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Care Home Occupancy */}
        <div className="col-span-1 border border-primary-200 dark:border-primary-800 shadow-sm rounded-lg overflow-hidden bg-white dark:bg-gray-900">
          <div className="px-4 py-3 border-b dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Care Home Occupancy</h3>
          </div>
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="px-4 py-2">Home Name</th>
                    <th className="px-4 py-2">Residents</th>
                    <th className="px-4 py-2">Available Beds</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.occupancy?.map((h, i) => (
                    <tr key={i} className="border-b dark:border-gray-800 text-gray-800 dark:text-gray-200">
                      <td className="px-4 py-2 font-medium">{h.home_name}</td>
                      <td className="px-4 py-2">{h.current_residents} / {h.capacity}</td>
                      <td className="px-4 py-2 text-green-600 dark:text-green-400 font-bold">{h.available_beds}</td>
                    </tr>
                  ))}
                  {!data?.occupancy?.length && <tr><td colSpan="3" className="px-4 py-4 text-center text-gray-500">No data found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Urgent Tasks */}
        <div className="col-span-1 border border-primary-200 dark:border-primary-800 shadow-sm rounded-lg overflow-hidden bg-white dark:bg-gray-900">
          <div className="px-4 py-3 border-b dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Urgent Unassigned Tasks (48h)</h3>
          </div>
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="px-4 py-2">Task ID</th>
                    <th className="px-4 py-2">Description</th>
                    <th className="px-4 py-2">Date Needed</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.urgent?.map((t, i) => (
                    <tr key={i} className="border-b dark:border-gray-800 text-gray-800 dark:text-gray-200">
                      <td className="px-4 py-2 text-gray-500 dark:text-gray-400">#{t.task_id}</td>
                      <td className="px-4 py-2">{t.description}</td>
                      <td className="px-4 py-2 text-red-500">{new Date(t.task_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {!data?.urgent?.length && <tr><td colSpan="3" className="px-4 py-4 text-center text-gray-500">No urgent unassigned tasks</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Verification Log */}
        <div className="col-span-1 border border-primary-200 dark:border-primary-800 shadow-sm rounded-lg overflow-hidden bg-white dark:bg-gray-900">
          <div className="px-4 py-3 border-b dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Admin Verification Log</h3>
          </div>
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="px-4 py-2">Volunteer</th>
                    <th className="px-4 py-2">ID Type</th>
                    <th className="px-4 py-2">Verified By</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.verificationLog?.map((v, i) => (
                    <tr key={i} className="border-b dark:border-gray-800 text-gray-800 dark:text-gray-200">
                      <td className="px-4 py-2 font-medium">{v.volunteer_target}</td>
                      <td className="px-4 py-2">{v.id_document_type}</td>
                      <td className="px-4 py-2 text-primary-600 dark:text-primary-400">{v.verified_by_admin}</td>
                    </tr>
                  ))}
                  {!data?.verificationLog?.length && <tr><td colSpan="3" className="px-4 py-4 text-center text-gray-500">No verification logs</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
