'use client'

import { useState, useEffect } from 'react'
import { getSupabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { QRCodeCanvas } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function DashboardPage() {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionMsg, setActionMsg] = useState({ type: '', text: '' })
  const router = useRouter()

  useEffect(() => { loadRegistrations() }, [])

  const loadRegistrations = async () => {
    const supabase = getSupabase()
    setLoading(true)
    const { data, error } = await supabase
      .from('registrations')
      .select('*, attendance(id)')
      .order('created_at', { ascending: false })
    if (!error) setRegistrations(data)
    setLoading(false)
  }

  const verifyPayment = async (id, email, row) => {
    const supabase = getSupabase()
    const qr_data = row.qr_data || `${email}::${id}::${Date.now()}`

    const updates = { payment_verified: true, qr_data }

    if (!row.email_sent) {
      updates.email_sent = false
    }

    const { error } = await supabase
      .from('registrations')
      .update(updates)
      .eq('id', id)

    if (error) {
      setActionMsg({ type: 'error', text: `Error: ${error.message}` })
      return
    }

    setActionMsg({ type: 'success', text: `Payment verified for ${email}` })

    if (row.email_sent) {
      setActionMsg({ type: 'success', text: `${email}: Payment already verified & email already sent.` })
      loadRegistrations()
      return
    }

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration_id: id, qr_data, name: row.name, email: row.email, section: row.section, roll_no: row.roll_no }),
      })
      const result = await res.json()
      if (res.ok) {
        await supabase.from('registrations').update({ email_sent: true }).eq('id', id)
        setActionMsg({ type: 'success', text: `Payment verified & email sent to ${email}` })
      } else {
        setActionMsg({ type: 'success', text: `Payment verified. Email error: ${result.error}` })
      }
    } catch {
      setActionMsg({ type: 'success', text: 'Payment verified. Email sending failed (network error).' })
    }

    loadRegistrations()
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const pending = registrations.filter(r => !r.payment_verified)
  const verified = registrations.filter(r => r.payment_verified)

  if (loading) return <div className="min-h-[calc(100vh-3.5rem)] bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background p-4 md:p-6">
      <Card className="max-w-6xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push('/admin/scan')}>Scan Attendance</Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
          </div>
        </CardHeader>
        <CardContent>
          {actionMsg.text && (
            <div className={`p-3 rounded-md text-sm mb-4 ${actionMsg.type === 'error' ? 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300' : 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300'}`}>
              {actionMsg.text}
            </div>
          )}

          {pending.length > 0 && (
            <div className="mb-8">
              <h3 className="font-semibold text-lg mb-3">Pending Verification ({pending.length})</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead><TableHead>Section</TableHead><TableHead>Roll No</TableHead>
                      <TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead>Payment SS</TableHead><TableHead>Email</TableHead><TableHead>Attendance</TableHead><TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pending.map(r => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.name}</TableCell>
                        <TableCell>{r.section}</TableCell>
                        <TableCell>{r.roll_no}</TableCell>
                        <TableCell>{r.email}</TableCell>
                        <TableCell>{r.phone}</TableCell>
                        <TableCell><a href={r.payment_screenshot_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">View</a></TableCell>
                        <TableCell>{r.email_sent ? <Badge variant="success">Sent</Badge> : <Badge variant="warning">Not Sent</Badge>}</TableCell>
                        <TableCell><Badge variant="warning">Pending</Badge></TableCell>
                        <TableCell><Button size="sm" onClick={() => verifyPayment(r.id, r.email, r)}>Verify Payment</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {verified.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Verified ({verified.length})</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead><TableHead>Section</TableHead><TableHead>Roll No</TableHead>
                      <TableHead>Email</TableHead><TableHead>Payment</TableHead><TableHead>Email</TableHead><TableHead>Attendance</TableHead><TableHead>QR</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {verified.map(r => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.name}</TableCell>
                        <TableCell>{r.section}</TableCell>
                        <TableCell>{r.roll_no}</TableCell>
                        <TableCell>{r.email}</TableCell>
                        <TableCell><Badge variant="success">Verified</Badge></TableCell>
                        <TableCell>{r.email_sent ? <Badge variant="success">Sent</Badge> : <Badge variant="warning">Not Sent</Badge>}</TableCell>
                        <TableCell>{r.attendance?.length > 0 ? <Badge variant="success">Present</Badge> : <Badge variant="warning">Not Marked</Badge>}</TableCell>
                        <TableCell><QRCodeCanvas value={r.qr_data} size={64} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {registrations.length === 0 && <p className="text-muted-foreground text-center py-8">No registrations yet.</p>}
        </CardContent>
      </Card>
    </div>
  )
}
