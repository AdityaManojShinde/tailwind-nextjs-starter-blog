'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminDashboard from '@/components/AdminDashboard'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if already authenticated
    const token = localStorage.getItem('admin-token')
    if (token) {
      verifyToken(token)
    } else {
      setLoading(false)
    }
  }, [])

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      if (response.ok) {
        setIsAuthenticated(true)
      } else {
        localStorage.removeItem('admin-token')
      }
    } catch (error) {
      localStorage.removeItem('admin-token')
    }
    setLoading(false)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('admin-token', data.token)
        setIsAuthenticated(true)
      } else {
        setError(data.error || 'Invalid password')
      }
    } catch (error) {
      setError('Login failed. Please try again.')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin-token')
    setIsAuthenticated(false)
    setPassword('')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8 dark:bg-gray-900">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-2xl font-extrabold text-gray-900 sm:text-3xl dark:text-white">
              Admin Login
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Enter your admin password to access the dashboard
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="focus:border-primary-500 focus:ring-primary-500 relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                placeholder="Admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <div className="text-center text-sm text-red-600 dark:text-red-400">{error}</div>
            )}
            <div>
              <button
                type="submit"
                className="group bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 relative flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white focus:ring-2 focus:ring-offset-2 focus:outline-none"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return <AdminDashboard onLogout={handleLogout} />
}
