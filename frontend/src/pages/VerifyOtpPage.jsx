import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { verifyOtp, clearAuthError } from '../store/authSlice'
import axiosInstance from '../api/axiosInstance'
import { KeyRound, Mail, AlertCircle, CheckCircle2, RotateCw, Sparkles, ArrowRight } from 'lucide-react'

export const VerifyOtpPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { status, error, user, isAuthenticated, devOtp: stateDevOtp } = useSelector((state) => state.auth)

  const emailParam = searchParams.get('email') || ''
  const [email, setEmail] = useState(emailParam)
  const [code, setCode] = useState('')
  const [resendStatus, setResendStatus] = useState('idle')
  const [resendMessage, setResendMessage] = useState('')

  const passedDevOtp = location.state?.devOtp || stateDevOtp

  useEffect(() => {
    dispatch(clearAuthError())
  }, [dispatch])

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'patient') navigate('/patient/intake', { replace: true })
      else if (['doctor', 'support'].includes(user.role)) navigate('/doctor/dashboard', { replace: true })
      else if (user.role === 'admin') navigate('/admin/dashboard', { replace: true })
      else if (user.role === 'ambulance') navigate('/ambulance/profile', { replace: true })
      else navigate('/', { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  const handleVerify = async (e) => {
    e.preventDefault()
    if (!email || !code) return
    await dispatch(verifyOtp({ email: email.trim().toLowerCase(), code: code.trim() }))
  }

  const handleResend = async () => {
    if (!email || resendStatus === 'loading') return
    setResendStatus('loading')
    setResendMessage('')
    try {
      const res = await axiosInstance.post('/auth/resend-otp', { email: email.trim().toLowerCase() })
      setResendStatus('succeeded')
      setResendMessage(res.data?.message || 'Verification code resent successfully!')
    } catch (err) {
      setResendStatus('failed')
      setResendMessage(err.response?.data?.message || 'Failed to resend code')
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-emerald-50/50 via-white to-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-950/5">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm mb-4">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
            Verify Your Email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter the 6-digit one-time passcode sent to your inbox
          </p>
        </div>

        {passedDevOtp && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm space-y-1">
            <div className="flex items-center gap-2 font-bold text-emerald-800">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Development Testing Passcode</span>
            </div>
            <p className="text-xs text-emerald-700">
              Auto-generated OTP: <span className="font-mono font-bold text-sm bg-white px-2 py-0.5 rounded-sm border border-emerald-300">{passedDevOtp}</span>
            </p>
            <button
              type="button"
              onClick={() => setCode(passedDevOtp)}
              className="text-xs font-bold text-emerald-800 underline hover:text-emerald-950 mt-1"
            >
              Fill OTP automatically
            </button>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {resendMessage && (
          <div className={`p-4 rounded-2xl border text-sm flex items-start gap-3 ${
            resendStatus === 'succeeded'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            {resendStatus === 'succeeded' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            )}
            <p className="font-semibold">{resendMessage}</p>
          </div>
        )}

        <form className="mt-6 space-y-5" onSubmit={handleVerify}>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Account Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="block w-full pl-10 pr-3.5 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              6-Digit Passcode
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="block w-full px-4 py-3 text-center text-2xl font-mono tracking-widest bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading' || code.length < 6}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-emerald-200/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {status === 'loading' ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Verify &amp; Sign In</span>
            )}
          </button>
        </form>

        <div className="pt-2 flex items-center justify-between border-t border-gray-100 text-xs">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendStatus === 'loading'}
            className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1.5 disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${resendStatus === 'loading' ? 'animate-spin' : ''}`} />
            <span>Resend Passcode</span>
          </button>

          <Link to="/login" className="font-semibold text-gray-500 hover:text-gray-800">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default VerifyOtpPage
