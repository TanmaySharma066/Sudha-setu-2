import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axiosInstance from '../../api/axiosInstance'
import { 
  Activity, 
  ShieldCheck, 
  Truck, 
  Users, 
  BookOpen, 
  Stethoscope, 
  AlertOctagon, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Loader2, 
  ArrowRight 
} from 'lucide-react'

export const AdminDashboardPage = () => {
  const [telemetry, setTelemetry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchTelemetry = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await axiosInstance.get('/admin/telemetry')
        setTelemetry(res.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load telemetry metrics')
      } finally {
        setLoading(false)
      }
    }

    fetchTelemetry()
  }, [])

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          <p className="text-xs font-semibold text-gray-600">Aggregating platform telemetry...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Activity className="w-3.5 h-3.5" />
            <span>National Tele-Health Operations Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
            Administrative Telemetry &amp; System Health
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Real-time analytics across autonomous triage, clinician queues, and verified Ayush medical rules.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
            {error}
          </div>
        )}

        {telemetry && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Doctor Pool</span>
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-gray-900">
                    {(telemetry.doctors?.verified || 0) + (telemetry.doctors?.unverified || 0)}
                  </span>
                  <span className="text-xs text-emerald-600 font-bold">
                    {telemetry.doctors?.verified || 0} Verified
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  {telemetry.doctors?.unverified || 0} pending medical credential verification
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Triage Confidence</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-gray-900">
                    {telemetry.averageConfidenceScore
                      ? `${Math.round(telemetry.averageConfidenceScore * 100)}%`
                      : 'N/A'}
                  </span>
                  <span className="text-xs text-emerald-600 font-bold">Average</span>
                </div>
                <p className="text-[11px] text-gray-400">Weighted clinical decision confidence score</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Knowledge Base</span>
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-gray-900">
                    {telemetry.activeKnowledgeBaseRules || 0}
                  </span>
                  <span className="text-xs text-teal-700 font-bold">Rules Active</span>
                </div>
                <p className="text-[11px] text-gray-400">Verified symptom triage algorithms</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">High Danger Alerts</span>
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                    <AlertOctagon className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-rose-600">
                    {telemetry.casesByDangerLevel?.high || 0}
                  </span>
                  <span className="text-xs text-rose-700 font-bold">Critical</span>
                </div>
                <p className="text-[11px] text-gray-400">Emergency hospital or dispatch alerts</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800">
                  Cases By Clinical Danger Level
                </h3>
                <div className="space-y-3 pt-2">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-rose-700">High (SOS Emergency)</span>
                      <span className="font-bold">{telemetry.casesByDangerLevel?.high || 0}</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-600 rounded-full"
                        style={{ width: `${Math.min(100, (telemetry.casesByDangerLevel?.high || 0) * 10)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-amber-700">Medium (Doctor Queue)</span>
                      <span className="font-bold">{telemetry.casesByDangerLevel?.medium || 0}</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${Math.min(100, (telemetry.casesByDangerLevel?.medium || 0) * 10)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-emerald-700">Low (Self-Care Home Remedies)</span>
                      <span className="font-bold">{telemetry.casesByDangerLevel?.low || 0}</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.min(100, (telemetry.casesByDangerLevel?.low || 0) * 10)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800">
                  Cases By Lifecycle Status
                </h3>
                <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                  {Object.entries(telemetry.casesByStatus || {}).map(([key, count]) => (
                    <div key={key} className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                      <span className="text-gray-400 block text-[10px] uppercase font-bold truncate">
                        {key.replace('_', ' ')}
                      </span>
                      <span className="text-lg font-bold text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Administrative Management Modules
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link
                  to="/admin/doctors"
                  className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-purple-300 shadow-xs hover:shadow-md transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Manage Doctors</h4>
                      <p className="text-xs text-gray-500">License verification &amp; onboarding</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-700 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/admin/ambulances"
                  className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-purple-300 shadow-xs hover:shadow-md transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Manage Ambulances</h4>
                      <p className="text-xs text-gray-500">Emergency fleet registration</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-700 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/admin/users"
                  className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-purple-300 shadow-xs hover:shadow-md transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Manage Users</h4>
                      <p className="text-xs text-gray-500">Role elevation &amp; accounts</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-700 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboardPage
