import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { loginUser, clearAuthError } from '../store/authSlice'
import { HeartHandshake, Lock, Mail, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react'

export const LoginPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { status, error, isAuthenticated, user } = useSelector((state) => state.auth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    dispatch(clearAuthError())
  }, [dispatch])

  useEffect(() => {
    if (isAuthenticated && user) {
      const fromPath = location.state?.from?.pathname
      if (fromPath && fromPath !== '/login' && fromPath !== '/register') {
        navigate(fromPath, { replace: true })
        return
      }

      if (user.role === 'patient') navigate('/patient/intake', { replace: true })
      else if (['doctor', 'support'].includes(user.role)) navigate('/doctor/dashboard', { replace: true })
      else if (user.role === 'admin') navigate('/admin/dashboard', { replace: true })
      else if (user.role === 'ambulance') navigate('/ambulance/profile', { replace: true })
      else navigate('/', { replace: true })
    }
  }, [isAuthenticated, user, navigate, location])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return
    await dispatch(loginUser({ email, password }))
  }

  const isUnverifiedEmail = error && error.toLowerCase().includes('verify your email')
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-emerald-50/50 via-white to-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-950/5">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm mb-4">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
            Sign in to Sudha Setu
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ayush Clinical Portal &amp; Tele-Triage System
          </p>
        </div>

        {error && (
          <div className={`p-4 rounded-2xl border text-sm ${
            isUnverifiedEmail
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            <div className="flex items-start gap-3">
              <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${
                isUnverifiedEmail ? 'text-amber-600' : 'text-rose-600'
              }`} />
              <div className="space-y-1">
                <p className="font-semibold">{error}</p>
                {isUnverifiedEmail && (
                  <Link
                    to={`/verify-otp?email=${encodeURIComponent(email)}`}
                    className="inline-flex items-center gap-1 font-bold underline hover:text-amber-950 mt-1"
                  >
                    Click here to verify your email via OTP
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Email Address
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-10 pr-3.5 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-emerald-200/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {status === 'loading' ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-gray-400 font-semibold tracking-wider">
              Or continue with
            </span>
          </div>
        </div>

        <a
          href={`${apiBaseUrl}/auth/google`}
          className="w-full py-3 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Sign in with Google</span>
        </a>

        <div className="text-center pt-2">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline">
              Register as Patient
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
