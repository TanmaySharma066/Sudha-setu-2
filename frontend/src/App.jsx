import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { checkAuth } from './store/authSlice'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import FloatingAiChat from './components/FloatingAiChat'

import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VerifyOtpPage from './pages/VerifyOtpPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import UnauthorizedPage from './pages/UnauthorizedPage'
import NotFoundPage from './pages/NotFoundPage'

import PatientIntakePage from './pages/patient/PatientIntakePage'
import PatientCaseDetailPage from './pages/patient/PatientCaseDetailPage'

import DoctorDashboardPage from './pages/doctor/DoctorDashboardPage'
import DoctorCaseDetailPage from './pages/doctor/DoctorCaseDetailPage'
import DoctorProfilePage from './pages/doctor/DoctorProfilePage'
import KnowledgeBasePage from './pages/doctor/KnowledgeBasePage'

import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminDoctorsPage from './pages/admin/AdminDoctorsPage'
import AdminAmbulancesPage from './pages/admin/AdminAmbulancesPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'

import AmbulanceProfilePage from './pages/ambulance/AmbulanceProfilePage'

export const App = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch])

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col font-sans antialiased selection:bg-emerald-200 selection:text-emerald-900">
      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          <Route
            path="/patient/intake"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientIntakePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient/cases/:caseId"
            element={
              <ProtectedRoute allowedRoles={['patient', 'doctor', 'support', 'admin']}>
                <PatientCaseDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['doctor', 'support', 'admin']}>
                <DoctorDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor/cases/:caseId"
            element={
              <ProtectedRoute allowedRoles={['doctor', 'support', 'admin']}>
                <DoctorCaseDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor/profile"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor/knowledge-base"
            element={
              <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                <KnowledgeBasePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/doctors"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDoctorsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/ambulances"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminAmbulancesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ambulance/profile"
            element={
              <ProtectedRoute allowedRoles={['ambulance']}>
                <AmbulanceProfilePage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <FloatingAiChat />
    </div>
  )
}

export default App
