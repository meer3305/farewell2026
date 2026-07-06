'use client'

import { useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { getSupabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'

export default function StatusPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [registration, setRegistration] = useState(null)
  const [error, setError] = useState('')

  const handleCheck = async (e) => {
    e.preventDefault()
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
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-bg min-h-[calc(100vh-3.5rem)] py-6 px-4">
      <div className="mx-auto w-full max-w-2xl space-y-3">
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="h-2 bg-primary" />
          <div className="p-6">
            <h1 className="text-3xl font-normal text-foreground">Check registration status</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Enter the email you used during registration.
            </p>
            <Separator className="my-4" />

            <form onSubmit={handleCheck} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-normal">
                  Email <span className="text-destructive">*</span>
                </Label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Your answer"
                  required
                  className="form-input"
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Checking...' : 'Check status'}
              </Button>
            </form>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {registration && (
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="h-2 bg-primary" />
            <div className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-medium text-foreground">{registration.name}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Section {registration.section} · Roll {registration.roll_no}
                </p>
              </div>
              <Badge variant={registration.payment_verified ? 'success' : 'warning'}>
                {registration.payment_verified ? 'Verified' : 'Pending'}
              </Badge>
            </div>

            <Separator />

            {registration.payment_verified && registration.qr_data ? (
              <div className="text-center space-y-3">
                <p className="text-sm text-foreground">Your entry QR code</p>
                <div className="inline-block p-3 rounded border border-border bg-white">
                  <QRCodeCanvas value={registration.qr_data} size={200} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Show this at the event for attendance.
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Your payment is being verified. Your QR code will appear here once approved.
              </p>
            )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
