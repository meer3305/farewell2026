'use client'

import { useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import { QRCodeCanvas } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

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
    <div className="min-h-[calc(100vh-3.5rem)] bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Check Status</CardTitle>
          <CardDescription>Enter your registered email</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCheck} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <Button type="submit" disabled={loading} className="w-full">{loading ? 'Checking...' : 'Check Status'}</Button>
          </form>

          {error && <div className="bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 p-3 rounded-md text-sm mt-4">{error}</div>}

          {registration && (
            <div className="mt-6 space-y-4">
              <h3 className="font-semibold text-lg">{registration.name}</h3>
              <p className="text-sm text-muted-foreground">Section: {registration.section} | Roll: {registration.roll_no}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Payment</span>
                <Badge variant={registration.payment_verified ? 'success' : 'warning'}>
                  {registration.payment_verified ? 'Verified' : 'Pending'}
                </Badge>
              </div>
              {registration.payment_verified && registration.qr_data && (
                <div className="text-center space-y-3 pt-2">
                  <p className="font-medium text-sm">Your QR Code</p>
                  <div className="inline-block p-3 bg-white rounded-lg border">
                    <QRCodeCanvas value={registration.qr_data} size={200} />
                  </div>
                  <p className="text-xs text-muted-foreground">Show this at the event for attendance verification</p>
                </div>
              )}
              {!registration.payment_verified && (
                <div className="bg-muted text-muted-foreground p-3 rounded-md text-sm">Your payment is being verified. Check back later.</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
