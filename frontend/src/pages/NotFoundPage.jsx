import React from 'react'
import { Link } from 'react-router-dom'
import { FileQuestion, Home } from 'lucide-react'

export const NotFoundPage = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-gray-50 via-white to-gray-50 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-gray-200 shadow-xl">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
          <FileQuestion className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-900">404</h1>
          <h2 className="text-lg font-bold text-gray-800 mt-1">Page Not Found</h2>
          <p className="mt-2 text-sm text-gray-600">
            The clinical route or page you are looking for does not exist in Sudha Setu.
          </p>
        </div>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Go to Portal Home</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
