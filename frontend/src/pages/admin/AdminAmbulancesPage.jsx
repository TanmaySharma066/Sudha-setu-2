import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axiosInstance from '../../api/axiosInstance'
import { 
  Truck, 
  Plus, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Loader2, 
  MapPin, 
  User 
} from 'lucide-react'

export const AdminAmbulancesPage = () => {
  const [ambulances, setAmbulances] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userId, setUserId] = useState('')
  const [vehicleNumber, setVehicleNumber] = useState('')
  const [stationName, setStationName] = useState('')
  const [serviceProvider, setServiceProvider] = useState('Govt 108 Emergency Fleet')
  const [registering, setRegistering] = useState(false)

  const [users, setUsers] = useState([])

  const fetchAmbulances = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await axiosInstance.get('/admin/ambulances')
      setAmbulances(res.data?.ambulances || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch ambulances')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get('/admin/users')
      setUsers(res.data?.users || [])
    } catch {
      setUsers([])
    }
  }

  useEffect(() => {
    fetchAmbulances()
  }, [])

  const handleOpenModal = () => {
    fetchUsers()
    setUserId('')
    setVehicleNumber('')
    setStationName('')
    setServiceProvider('Govt 108 Emergency Fleet')
    setIsModalOpen(true)
  }

  const handleRegisterAmbulance = async (e) => {
    e.preventDefault()
    if (!userId || !vehicleNumber || !stationName) return
    setRegistering(true)
    setError('')
    setSuccess('')

    try {
      await axiosInstance.post('/admin/ambulances', {
        userId,
        vehicleNumber: vehicleNumber.trim().toUpperCase(),
        stationName: stationName.trim(),
        serviceProvider: serviceProvider.trim()
      })
      setSuccess('Ambulance registered and user promoted to ambulance role!')
      setIsModalOpen(false)
      fetchAmbulances()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setRegistering(false)
    }
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
              <Truck className="w-7 h-7 text-purple-600" />
              <span>Emergency Ambulances &amp; First Responders</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Registered emergency medical response units dispatched during high-danger patient triage.
            </p>
          </div>

          <button
            onClick={handleOpenModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Register Ambulance</span>
          </button>
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
                  <th className="px-6 py-4">Vehicle Number</th>
                  <th className="px-6 py-4">Base Station</th>
                  <th className="px-6 py-4">Service Provider</th>
                  <th className="px-6 py-4">Linked Driver Account</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                        <span>Loading emergency fleet...</span>
                      </div>
                    </td>
                  </tr>
                ) : ambulances.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      No ambulances registered yet.
                    </td>
                  </tr>
                ) : (
                  ambulances.map((a) => (
                    <tr key={a._id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-gray-900 text-sm">
                        {a.vehicleNumber}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-gray-800 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-purple-600" />
                          <span>{a.stationName}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">
                        {a.serviceProvider || 'National Health Mission'}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900">{a.userId?.name || 'Driver / Unit'}</span>
                          <span className="text-gray-400 text-[11px] font-mono">{a.userId?.email}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Active Dispatch Ready
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-200 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <Truck className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-base text-gray-900">Register Emergency Vehicle</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterAmbulance} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Assign Driver / Operator User *
                </label>
                <select
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-gray-900"
                >
                  <option value="">-- Choose User Account --</option>
                  {users.map((u) => (
                    <option key={u.id || u._id} value={u.id || u._id}>
                      {u.name} ({u.email}) - Current Role: {u.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Vehicle License Plate *
                </label>
                <input
                  type="text"
                  required
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="e.g. DL-01-AY-108"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Base Station / Depot Name *
                </label>
                <input
                  type="text"
                  required
                  value={stationName}
                  onChange={(e) => setStationName(e.target.value)}
                  placeholder="e.g. Central District Trauma Center Station"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Service Provider
                </label>
                <input
                  type="text"
                  value={serviceProvider}
                  onChange={(e) => setServiceProvider(e.target.value)}
                  placeholder="e.g. Govt 108 Emergency Fleet"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registering}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {registering && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Register Vehicle</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminAmbulancesPage
