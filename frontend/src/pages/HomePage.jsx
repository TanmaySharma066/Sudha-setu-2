import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, Link } from 'react-router-dom'
import { HeartHandshake, Stethoscope, ShieldCheck, ArrowRight, Activity, Sparkles } from 'lucide-react'

export const HomePage = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth)

  if (isAuthenticated && user) {
    if (user.role === 'patient') return <Navigate to="/patient/intake" replace />
    if (['doctor', 'support'].includes(user.role)) return <Navigate to="/doctor/dashboard" replace />
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />
    if (user.role === 'ambulance') return <Navigate to="/ambulance/profile" replace />
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-emerald-50/70 via-white to-emerald-50/30 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs sm:text-sm font-semibold border border-emerald-200">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Smart India Hackathon SIH26047 • Ministry of Ayush</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-gray-950 tracking-tight leading-tight">
          Intelligent Clinical Triage &amp;{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-600">
            Ayurvedic Tele-Consultation
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg text-gray-600 leading-relaxed">
          Sudha Setu bridges traditional Indian medicine with modern clinical decision support. Multilingual voice intake, autonomous danger classification, and direct physician OPD routing.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/patient/intake"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg hover:shadow-emerald-200/50 transition-all hover:scale-[1.02]"
          >
            <span>Start Patient Voice Intake</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white hover:bg-gray-50 text-gray-900 font-bold text-base border border-gray-200 shadow-xs transition-colors"
          >
            <span>Staff / Doctor Sign In</span>
            <Stethoscope className="w-5 h-5 text-emerald-600" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 text-left">
          <div className="p-6 rounded-2xl bg-white border border-emerald-100 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-base">Multilingual Voice Intake</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Express symptoms naturally in Hindi or English with speech recognition and structured clinical extraction.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-emerald-100 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-base">3-Tier Safety Engine</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Autonomous triage distinguishing between self-care home remedies, OPD consultation, and emergency alerts.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-emerald-100 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-base">Verified Ayush E-Prescription</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Verified clinical practitioners review OPD queues in real-time and issue standard Ayush clinical case sheet PDFs.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
