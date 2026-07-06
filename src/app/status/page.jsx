'use client'

import { useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { getSupabase } from '@/lib/supabase'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, Download, Ticket, Wallet } from 'lucide-react'
import { EASE_PREMIUM, fadeUp } from '@/lib/motion'

export default function StatusPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [registration, setRegistration] = useState(null)
  const [error, setError] = useState('')

  const handleCheck = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setRegistration(null)
    const supabase = getSupabase()

    try {
      const { data, error: dbError } = await supabase
        .from('registrations')
        .select('*')
        .eq('email', email)
        .single()
      if (dbError) throw new Error('No registration found for this email')
      setRegistration(data)
    } catch (statusError) {
      setError(statusError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-bg py-10 px-4 sm:px-6">
      <div className="section-shell">
        <motion.div
          className="glass-panel p-6 sm:p-9 max-w-3xl mx-auto"
          {...fadeUp({ duration: 0.55, y: 18 })}
        >
          <p className="premium-kicker">Ticket Status</p>
          <h1 className="section-title mt-3">Check Your Invitation</h1>
          <p className="mt-3 text-[#b5b5b5]">Enter the email used during registration to view your approval status and digital pass.</p>

          <form onSubmit={handleCheck} className="mt-8 space-y-4">
            <div className="space-y-2 floating-field">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder=" "
                required
                className="form-input"
              />
              <Label htmlFor="email" className="floating-label">Email <span className="text-[#7a263f]">*</span></Label>
            </div>
            <Button type="submit" disabled={loading}>{loading ? 'Checking...' : 'Check Status'}</Button>
          </form>
        </motion.div>

        {error && (
          <Alert variant="destructive" className="max-w-3xl mx-auto mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <AnimatePresence>
          {registration && (
            <motion.div
              className="max-w-3xl mx-auto mt-6"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.45, ease: EASE_PREMIUM }}
            >
              <div className="glass-panel p-6 sm:p-9">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-3xl">{registration.name}</h2>
                    <p className="mt-2 text-[#b5b5b5]">Section {registration.section} · Roll {registration.roll_no}</p>
                  </div>
                  <Badge variant={registration.payment_verified ? 'success' : 'warning'}>
                    {registration.payment_verified ? 'Verified' : 'Pending'}
                  </Badge>
                </div>

                <div className="glass-divider my-6" />

                {registration.payment_verified && registration.qr_data ? (
                  <div className="status-invite p-5 sm:p-7">
                    <div className="relative z-10">
                      <p className="premium-kicker">Luxury Invitation Pass</p>
                      <h3 className="text-2xl mt-2">EPILOGUE'26 Entry Card</h3>
                      <div className="mt-4 grid sm:grid-cols-[1fr_auto] gap-5 items-center">
                        <div className="space-y-1 text-sm text-white/90">
                          <p className="inline-flex items-center gap-2"><Ticket size={14} /> Ticket ID: {registration.id}</p>
                          <p className="inline-flex items-center gap-2"><CalendarDays size={14} /> Event: EPILOGUE'26 Farewell</p>
                          <p className="text-[#b5b5b5]">Show this QR at the entry gate.</p>
                        </div>

                        <div className="inline-block p-3 rounded-xl border border-white/25 bg-white shadow-lg">
                          <QRCodeCanvas value={registration.qr_data} size={190} />
                        </div>
                      </div>

                      <div className="mt-6 flex flex-wrap gap-3">
                        <button type="button" className="magnetic-btn secondary" onClick={() => window.print()}>
                          <Download size={15} className="inline mr-2" /> Download Pass
                        </button>
                        <button type="button" className="magnetic-btn secondary" aria-label="Add this pass to wallet placeholder">
                          <Wallet size={15} className="inline mr-2" /> Add to Wallet
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-[#b5b5b5]">
                    Your payment is under verification. As soon as it is approved, your QR invitation will appear here.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
