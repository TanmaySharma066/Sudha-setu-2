import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { logoutUser } from '../store/authSlice'
import { 
  HeartHandshake, 
  Stethoscope, 
  BookOpen, 
  UserCircle, 
  ShieldCheck, 
  Users, 
  Truck, 
  LogOut, 
  Menu, 
  X,
  FilePlus2,
  Activity
} from 'lucide-react'

export const Navbar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await dispatch(logoutUser())
    navigate('/login')
  }

  const roleBadgeColor = {
    doctor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    admin: 'bg-purple-100 text-purple-800 border-purple-200',
    patient: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    support: 'bg-amber-100 text-amber-800 border-amber-200',
    ambulance: 'bg-rose-100 text-rose-800 border-rose-200'
  }[user?.role] || 'bg-gray-100 text-gray-800 border-gray-200'

  return (
    <nav className="bg-white border-b border-emerald-100 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-emerald-950 flex items-center gap-1.5">
                  Sudha Setu
                  <span className="text-xs px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 font-semibold uppercase tracking-wider">
                    Ayush
                  </span>
                </span>
                <span className="text-xs text-emerald-600 font-medium -mt-1">
                  सुधा सेतु • Digital Health Bridge
                </span>
              </div>
            </Link>

            {isAuthenticated && user && (
              <div className="hidden md:flex items-center gap-1 ml-6 pl-6 border-l border-gray-200">
                {user.role === 'patient' && (
                  <Link
                    to="/patient/intake"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === '/patient/intake'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-50'
                    }`}
                  >
                    <FilePlus2 className="w-4 h-4" />
                    New Intake
                  </Link>
                )}

                {['doctor', 'support', 'admin'].includes(user.role) && (
                  <Link
                    to="/doctor/dashboard"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === '/doctor/dashboard'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-50'
                    }`}
                  >
                    <Stethoscope className="w-4 h-4" />
                    OPD Queue
                  </Link>
                )}

                {['doctor', 'admin'].includes(user.role) && (
                  <Link
                    to="/doctor/knowledge-base"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === '/doctor/knowledge-base'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-50'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    Knowledge Base
                  </Link>
                )}

                {user.role === 'doctor' && (
                  <Link
                    to="/doctor/profile"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === '/doctor/profile'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-50'
                    }`}
                  >
                    <UserCircle className="w-4 h-4" />
                    My Profile
                  </Link>
                )}

                {user.role === 'admin' && (
                  <>
                    <Link
                      to="/admin/dashboard"
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        location.pathname === '/admin/dashboard'
                          ? 'bg-purple-50 text-purple-700'
                          : 'text-gray-600 hover:text-purple-700 hover:bg-gray-50'
                      }`}
                    >
                      <Activity className="w-4 h-4" />
                      Telemetry
                    </Link>
                    <Link
                      to="/admin/doctors"
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        location.pathname === '/admin/doctors'
                          ? 'bg-purple-50 text-purple-700'
                          : 'text-gray-600 hover:text-purple-700 hover:bg-gray-50'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Doctors
                    </Link>
                    <Link
                      to="/admin/ambulances"
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        location.pathname === '/admin/ambulances'
                          ? 'bg-purple-50 text-purple-700'
                          : 'text-gray-600 hover:text-purple-700 hover:bg-gray-50'
                      }`}
                    >
                      <Truck className="w-4 h-4" />
                      Ambulances
                    </Link>
                    <Link
                      to="/admin/users"
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        location.pathname === '/admin/users'
                          ? 'bg-purple-50 text-purple-700'
                          : 'text-gray-600 hover:text-purple-700 hover:bg-gray-50'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      Users
                    </Link>
                  </>
                )}

                {user.role === 'ambulance' && (
                  <Link
                    to="/ambulance/profile"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === '/ambulance/profile'
                        ? 'bg-rose-50 text-rose-700'
                        : 'text-gray-600 hover:text-rose-700 hover:bg-gray-50'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    Ambulance Profile
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800">{user.name}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium border capitalize ${roleBadgeColor}`}
                    >
                      {user.role}
                    </span>
                  </div>
                  {user.abhaId && (
                    <span className="text-xs text-gray-500 font-mono">ABHA: {user.abhaId}</span>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-emerald-700 hover:bg-emerald-50"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-2 pb-4 space-y-1">
          {isAuthenticated && user ? (
            <>
              <div className="py-2 px-3 mb-2 bg-gray-50 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium border capitalize ${roleBadgeColor}`}>
                  {user.role}
                </span>
              </div>

              {user.role === 'patient' && (
                <Link
                  to="/patient/intake"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <FilePlus2 className="w-5 h-5" />
                  New Intake
                </Link>
              )}

              {['doctor', 'support', 'admin'].includes(user.role) && (
                <Link
                  to="/doctor/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <Stethoscope className="w-5 h-5" />
                  OPD Queue
                </Link>
              )}

              {['doctor', 'admin'].includes(user.role) && (
                <Link
                  to="/doctor/knowledge-base"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <BookOpen className="w-5 h-5" />
                  Knowledge Base
                </Link>
              )}

              {user.role === 'doctor' && (
                <Link
                  to="/doctor/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <UserCircle className="w-5 h-5" />
                  My Profile
                </Link>
              )}

              {user.role === 'admin' && (
                <>
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                  >
                    <Activity className="w-5 h-5" />
                    Telemetry
                  </Link>
                  <Link
                    to="/admin/doctors"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    Doctors
                  </Link>
                  <Link
                    to="/admin/ambulances"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                  >
                    <Truck className="w-5 h-5" />
                    Ambulances
                  </Link>
                  <Link
                    to="/admin/users"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                  >
                    <Users className="w-5 h-5" />
                    Users
                  </Link>
                </>
              )}

              {user.role === 'ambulance' && (
                <Link
                  to="/ambulance/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-rose-50 hover:text-rose-700"
                >
                  <Truck className="w-5 h-5" />
                  Ambulance Profile
                </Link>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleLogout()
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </>
          ) : (
            <div className="pt-2 space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg"
              >
                Log in
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar
