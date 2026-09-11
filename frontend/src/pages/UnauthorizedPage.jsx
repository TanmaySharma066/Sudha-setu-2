import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldX, ArrowLeft, Home } from 'lucide-react'

export const UnauthorizedPage = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-gray-50 via-white to-gray-50 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-gray-200 shadow-xl">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
          <ShieldX className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Access Restricted</h1>
          <p className="mt-2 text-sm text-gray-600">
            You do not have the required clinical or administrative role permissions to view this resource.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default UnauthorizedPage
