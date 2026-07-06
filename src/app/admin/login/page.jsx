'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { fadeUp } from '@/lib/motion'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const result = await res.json()

      if (!res.ok) throw new Error(result.error || 'Login failed')

      router.push('/admin/dashboard')
    } catch (loginError) {
      setError(loginError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-bg min-h-[70vh] px-4 py-10 grid place-items-center">
      <motion.div
        className="glass-panel w-full max-w-md p-7"
        {...fadeUp({ duration: 0.5, y: 16 })}
      >
        <div className="w-12 h-12 rounded-full border border-white/20 bg-white/5 grid place-items-center text-[#b8bec8]">
          <ShieldCheck size={20} />
        </div>
        <h1 className="text-4xl mt-5">Admin Login</h1>
        <p className="mt-2 text-sm text-[#b5b5b5]">Secure access for payment verification and attendance operations.</p>

        {error && (
          <div className="mt-5 rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-200 inline-flex items-center gap-2">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div className="space-y-2 floating-field">
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              placeholder=" "
              className="form-input"
            />
            <label htmlFor="password" className="floating-label">Admin Password</label>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </motion.div>
    </div>
  )
}
