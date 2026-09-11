import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import axiosInstance from '../../api/axiosInstance'
import { UserCircle, ShieldCheck, AlertCircle, CheckCircle2, Award, Briefcase, FileText, Loader2 } from 'lucide-react'

export const DoctorProfilePage = () => {
  const { user } = useSelector((state) => state.auth)
  const [profile, setProfile] = useState(null)
  const [yearsOfExperience, setYearsOfExperience] = useState(0)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const fetchProfile = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await axiosInstance.get('/doctor/me/profile')
      if (res.data?.doctor) {
        setProfile(res.data.doctor)
        setYearsOfExperience(res.data.doctor.yearsOfExperience || 0)
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setProfile(null)
      } else {
        setError(err.response?.data?.message || 'Failed to fetch doctor profile')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleUpdate = async (e) => {
    e.preventDefault()
    setUpdating(true)
    setMessage('')
    setError('')
    try {
      const res = await axiosInstance.patch('/doctor/me/profile', {
        yearsOfExperience: Number(yearsOfExperience)
      })
      setProfile(res.data?.doctor)
      setMessage('Years of experience updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update experience')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-xs font-semibold text-gray-600">Loading doctor credentials...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
            <UserCircle className="w-8 h-8 text-emerald-600" />
            <span>Doctor Profile &amp; Verification</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Registered medical practitioner credentials under Ministry of Ayush.
          </p>
        </div>

        {message && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">{message}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {!profile ? (
          <div className="p-8 bg-white rounded-3xl border border-amber-200 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
            <h2 className="text-base font-bold text-gray-900">Doctor Profile Pending Onboarding</h2>
            <p className="text-xs text-gray-600 max-w-sm mx-auto">
              Your account is marked as doctor role, but official clinical license registration must be completed by a platform administrator.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
                  Dr
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{user?.name}</h2>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>

              <div>
                {profile.verified ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Practitioner
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    Verification Pending
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
                <div className="flex items-center gap-1.5 text-gray-400 font-bold uppercase text-[10px]">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Clinical Specialization</span>
                </div>
                <p className="font-bold text-gray-900 text-sm">{profile.specialization || 'Ayurvedic Medicine'}</p>
                <span className="text-[10px] text-gray-400">Admin-locked credential</span>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
                <div className="flex items-center gap-1.5 text-gray-400 font-bold uppercase text-[10px]">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Medical Registration Number</span>
                </div>
                <p className="font-mono font-bold text-gray-900 text-sm">
                  {profile.medicalRegistrationNumber}
                </p>
                <span className="text-[10px] text-gray-400">Verified state/central medical register</span>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 pt-4 border-t border-gray-100">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Years of Clinical Practice
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    max={70}
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value)}
                    className="w-32 p-3 text-sm font-semibold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
                  >
                    {updating ? 'Saving...' : 'Update Years'}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  You can update your active clinical experience anytime. Specialization and registration number changes require administrative validation.
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default DoctorProfilePage
