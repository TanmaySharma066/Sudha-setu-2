import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { Activity } from 'lucide-react'

export const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { user, isAuthenticated, status } = useSelector((state) => state.auth)
  const location = useLocation()

  if (status === 'loading' || (status === 'idle' && !isAuthenticated)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-50/50">
        <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-2xl shadow-sm border border-emerald-100">
          <Activity className="w-10 h-10 text-emerald-600 animate-pulse" />
          <p className="text-sm font-medium text-emerald-900">Verifying session...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children ? children : <Outlet />
}

export default ProtectedRoute
