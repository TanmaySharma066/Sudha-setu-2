import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import axiosInstance from '../../api/axiosInstance'
import { Truck, MapPin, Building, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react'

export const AmbulanceProfilePage = () => {
  const { user } = useSelector((state) => state.auth)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAmbulanceProfile = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await axiosInstance.get('/ambulance/me/profile')
        setProfile(res.data?.ambulance)
      } catch (err) {
        if (err.response?.status === 404) {
          setProfile(null)
        } else {
          setError(err.response?.data?.message || 'Failed to fetch ambulance profile')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchAmbulanceProfile()
  }, [])

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
          <p className="text-xs font-semibold text-gray-600">Loading emergency unit profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight flex items-center gap-2.5">
            <Truck className="w-8 h-8 text-rose-600" />
            <span>Ambulance Unit Profile</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Registered Emergency Medical Response Unit for Ayush critical triage.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {!profile ? (
          <div className="p-8 bg-white rounded-3xl border border-gray-200 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
            <h2 className="text-base font-bold text-gray-900">Vehicle Assignment Pending</h2>
            <p className="text-xs text-gray-600 max-w-sm mx-auto">
              Your account has the ambulance role, but an emergency vehicle registration has not been assigned by an administrator yet.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{profile.vehicleNumber}</h2>
                  <p className="text-xs text-gray-500">Emergency First Responder</p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Dispatch Ready
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
                <div className="flex items-center gap-1.5 text-gray-400 font-bold uppercase text-[10px]">
                  <MapPin className="w-3.5 h-3.5 text-rose-600" />
                  <span>Base Station / Depot</span>
                </div>
                <p className="font-bold text-gray-900 text-sm">{profile.stationName}</p>
                <span className="text-[10px] text-gray-400">Assigned deployment location</span>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
                <div className="flex items-center gap-1.5 text-gray-400 font-bold uppercase text-[10px]">
                  <Building className="w-3.5 h-3.5 text-rose-600" />
                  <span>Service Provider</span>
                </div>
                <p className="font-bold text-gray-900 text-sm">
                  {profile.serviceProvider || 'Govt 108 Emergency Medical Services'}
                </p>
                <span className="text-[10px] text-gray-400">Emergency partner organisation</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs space-y-2">
              <span className="text-[10px] font-bold uppercase text-gray-400 block">Operator Account</span>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">{user?.name}</p>
                  <p className="text-gray-500 font-mono text-[11px]">{user?.email}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold border border-rose-200 uppercase">
                  ambulance
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AmbulanceProfilePage
