import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axiosInstance from '../../api/axiosInstance'
import { 
  ShieldCheck, 
  Plus, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  UserPlus, 
  X, 
  Loader2, 
  Briefcase, 
  FileText 
} from 'lucide-react'

export const AdminDoctorsPage = () => {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [candidateUserId, setCandidateUserId] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [regNumber, setRegNumber] = useState('')
  const [experience, setExperience] = useState(0)
  const [onboarding, setOnboarding] = useState(false)

  const [patientUsers, setPatientUsers] = useState([])

  const fetchDoctors = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await axiosInstance.get('/admin/doctors')
      setDoctors(res.data?.doctors || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch doctors list')
    } finally {
      setLoading(false)
    }
  }

  const fetchEligibleUsers = async () => {
    try {
      const res = await axiosInstance.get('/admin/users')
      setPatientUsers(res.data?.users || [])
    } catch {
      setPatientUsers([])
    }
  }

  useEffect(() => {
    fetchDoctors()
  }, [])

  const handleOpenModal = () => {
    fetchEligibleUsers()
    setCandidateUserId('')
    setSpecialization('')
    setRegNumber('')
    setExperience(0)
    setIsModalOpen(true)
  }

  const handleVerifyDoctor = async (doctorId) => {
    try {
      await axiosInstance.patch(`/admin/doctors/${doctorId}/verify`)
      setSuccess('Doctor credentials verified successfully!')
      fetchDoctors()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed')
    }
  }

  const handleOnboardSubmit = async (e) => {
    e.preventDefault()
    if (!candidateUserId || !specialization || !regNumber) return
    setOnboarding(true)
    setError('')
    setSuccess('')

    try {
      await axiosInstance.post('/admin/doctors', {
        userId: candidateUserId,
        specialization: specialization.trim(),
        medicalRegistrationNumber: regNumber.trim(),
        yearsOfExperience: Number(experience)
      })
      setSuccess('Doctor onboarded and elevated to clinician role!')
      setIsModalOpen(false)
      fetchDoctors()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Doctor onboarding failed')
    } finally {
      setOnboarding(false)
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
              <ShieldCheck className="w-7 h-7 text-purple-600" />
              <span>Ayush Medical Officers &amp; Clinicians</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Verify state licensing registration numbers and onboard certified practitioners.
            </p>
          </div>

          <button
            onClick={handleOpenModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-colors self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Onboard Doctor</span>
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
                  <th className="px-6 py-4">Practitioner</th>
                  <th className="px-6 py-4">Specialization</th>
                  <th className="px-6 py-4">Registration No.</th>
                  <th className="px-6 py-4">Experience</th>
                  <th className="px-6 py-4">Verification</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                        <span>Loading doctor registry...</span>
                      </div>
                    </td>
                  </tr>
                ) : doctors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      No registered doctors currently on platform.
                    </td>
                  </tr>
                ) : (
                  doctors.map((d) => (
                    <tr key={d._id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 text-sm">
                            {d.userId?.name || 'Doctor'}
                          </span>
                          <span className="text-gray-400 font-mono text-[11px]">
                            {d.userId?.email}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">
                        {d.specialization}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap font-mono text-gray-700">
                        {d.medicalRegistrationNumber}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {d.yearsOfExperience || 0} years
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          d.verified
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {d.verified ? 'Verified Practitioner' : 'Unverified'}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {!d.verified && (
                          <button
                            onClick={() => handleVerifyDoctor(d._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Verify License</span>
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-200 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-base text-gray-900">Onboard Medical Practitioner</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOnboardSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Select User Account *
                </label>
                <select
                  required
                  value={candidateUserId}
                  onChange={(e) => setCandidateUserId(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-gray-900"
                >
                  <option value="">-- Choose Registered User --</option>
                  {patientUsers.map((u) => (
                    <option key={u.id || u._id} value={u.id || u._id}>
                      {u.name} ({u.email}) - Current Role: {u.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Ayush Specialization *
                </label>
                <input
                  type="text"
                  required
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="e.g. Kayachikitsa / Ayurvedic Internal Medicine"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Medical Registration Number *
                </label>
                <input
                  type="text"
                  required
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  placeholder="e.g. AYUSH-DL-2024-8841"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  min={0}
                  max={70}
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
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
                  disabled={onboarding}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {onboarding && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Confirm Onboarding</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDoctorsPage
