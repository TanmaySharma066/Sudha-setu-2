import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axiosInstance from '../../api/axiosInstance'
import { 
  Users, 
  ArrowLeft, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Filter, 
  Loader2, 
  Shield 
} from 'lucide-react'

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [roleFilter, setRoleFilter] = useState('')
  const [elevatingUser, setElevatingUser] = useState(null)
  const [targetRole, setTargetRole] = useState('support')
  const [submitting, setSubmitting] = useState(false)

  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const url = roleFilter ? `/admin/users?role=${roleFilter}` : '/admin/users'
      const res = await axiosInstance.get(url)
      setUsers(res.data?.users || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [roleFilter])

  const handleRoleChangeSubmit = async (e) => {
    e.preventDefault()
    if (!elevatingUser) return
    setSubmitting(true)
    setError('')
    setSuccess('')

    const userId = elevatingUser.id || elevatingUser._id
    try {
      await axiosInstance.patch(`/admin/users/${userId}/role`, {
        role: targetRole
      })
      setSuccess(`User role updated to ${targetRole} successfully!`)
      setElevatingUser(null)
      fetchUsers()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Role change failed')
    } finally {
      setSubmitting(false)
    }
  }

  const roleBadgeStyle = {
    doctor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    admin: 'bg-purple-100 text-purple-800 border-purple-200',
    patient: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    support: 'bg-amber-100 text-amber-800 border-amber-200',
    ambulance: 'bg-rose-100 text-rose-800 border-rose-200'
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-purple-700 mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Admin Dashboard</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight flex items-center gap-2.5">
              <Users className="w-7 h-7 text-purple-600" />
              <span>Platform Accounts &amp; RBAC Control</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Elevate user accounts to Support or Administrator privilege tiers.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-xs">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs bg-transparent border-none text-gray-700 focus:outline-none font-semibold"
            >
              <option value="">All Account Roles</option>
              <option value="patient">Patients</option>
              <option value="doctor">Doctors</option>
              <option value="support">Support Agents</option>
              <option value="ambulance">Ambulance Operators</option>
              <option value="admin">Administrators</option>
            </select>
          </div>
        </div>

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">{success}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">ABHA ID</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Role Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                        <span>Loading platform accounts...</span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      No users found matching query.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id || u._id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">
                        {u.name}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap font-mono text-gray-600">
                        {u.email}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                          roleBadgeStyle[u.role] || 'bg-gray-100 text-gray-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap font-mono text-gray-500">
                        {u.abhaId || '—'}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          u.emailVerified
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {u.emailVerified ? 'Verified' : 'Pending OTP'}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => {
                              setElevatingUser(u)
                              setTargetRole(u.role === 'support' ? 'admin' : 'support')
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-purple-50 text-gray-700 hover:text-purple-700 font-semibold text-xs transition-colors"
                          >
                            <Shield className="w-3.5 h-3.5" />
                            <span>Change Role</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {elevatingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-200 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-base text-gray-900">Elevate User Access</h3>
              </div>
              <button
                onClick={() => setElevatingUser(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRoleChangeSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Target Account</span>
                <p className="font-bold text-gray-900">{elevatingUser.name}</p>
                <p className="text-gray-500 font-mono">{elevatingUser.email}</p>
                <p className="text-gray-500 text-[11px] pt-1">
                  Current Role: <strong className="capitalize">{elevatingUser.role}</strong>
                </p>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Promote Role To *
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-semibold text-gray-900"
                >
                  <option value="support">Support (Clinician queue viewer)</option>
                  <option value="admin">Administrator (Full system privileges)</option>
                </select>
                <p className="text-[10px] text-gray-400 mt-1">
                  Note: Doctor and ambulance roles must be registered through their respective dedicated credential onboarding modules.
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setElevatingUser(null)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Role</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsersPage
