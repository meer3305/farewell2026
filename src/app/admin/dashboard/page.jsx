'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeCanvas } from 'qrcode.react'
import { getSupabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { EASE_PREMIUM, fadeUp } from '@/lib/motion'

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

  const pending = registrations.filter((registration) => !registration.payment_verified)
  const verified = registrations.filter((registration) => registration.payment_verified)

  if (loading) {
    return (
      <div className="page-bg min-h-[70vh] grid place-items-center">
        <p className="text-[#b5b5b5]">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="page-bg px-4 py-8">
      <div className="section-shell">
        <motion.div
          className="glass-panel p-5 sm:p-7"
          {...fadeUp({ duration: 0.52, y: 18 })}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="premium-kicker">Admin Dashboard</p>
              <h1 className="text-3xl sm:text-4xl mt-2">Registrations Control Center</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => router.push('/admin/scan')}>Scan Attendance</Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
            </div>
          </div>

          {actionMsg.text && (
            <div className={`mt-4 rounded-xl px-4 py-3 text-sm ${actionMsg.type === 'error' ? 'border border-red-500/40 bg-red-500/10 text-red-200' : 'border border-[#7a263f]/40 bg-[#7a263f]/10 text-[#f0d8df]'}`}>
              {actionMsg.text}
            </div>
          )}

          {pending.length > 0 && (
            <div className="mt-7">
              <h2 className="text-2xl">Pending Verification ({pending.length})</h2>
              <div className="mt-3 overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-sm">
                  <thead className="bg-white/6 text-[#b8bec8]">
                    <tr>
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Section</th>
                      <th className="p-3 text-left">Roll</th>
                      <th className="p-3 text-left">Email</th>
                      <th className="p-3 text-left">Phone</th>
                      <th className="p-3 text-left">Payment SS</th>
                      <th className="p-3 text-left">Email</th>
                      <th className="p-3 text-left">Attendance</th>
                      <th className="p-3 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map((registration) => (
                      <motion.tr key={registration.id} className="border-t border-white/10 hover:bg-white/5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.24, ease: EASE_PREMIUM }}>
                        <td className="p-3">{registration.name}</td>
                        <td className="p-3">{registration.section}</td>
                        <td className="p-3">{registration.roll_no}</td>
                        <td className="p-3">{registration.email}</td>
                        <td className="p-3">{registration.phone}</td>
                        <td className="p-3">
                          <a href={registration.payment_screenshot_url} target="_blank" rel="noopener noreferrer" className="text-[#b8bec8] hover:underline">View</a>
                        </td>
                        <td className="p-3">{registration.email_sent ? <Badge variant="success">Sent</Badge> : <Badge variant="warning">Not Sent</Badge>}</td>
                        <td className="p-3"><Badge variant="warning">Pending</Badge></td>
                        <td className="p-3"><Button size="sm" onClick={() => verifyPayment(registration.id, registration.email, registration)}>Verify Payment</Button></td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {verified.length > 0 && (
            <div className="mt-9">
              <h2 className="text-2xl">Verified ({verified.length})</h2>
              <div className="mt-3 overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-sm">
                  <thead className="bg-white/6 text-[#b8bec8]">
                    <tr>
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Section</th>
                      <th className="p-3 text-left">Roll</th>
                      <th className="p-3 text-left">Email</th>
                      <th className="p-3 text-left">Payment</th>
                      <th className="p-3 text-left">Email</th>
                      <th className="p-3 text-left">Attendance</th>
                      <th className="p-3 text-left">QR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verified.map((registration) => (
                      <motion.tr key={registration.id} className="border-t border-white/10 hover:bg-white/5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.24, ease: EASE_PREMIUM }}>
                        <td className="p-3">{registration.name}</td>
                        <td className="p-3">{registration.section}</td>
                        <td className="p-3">{registration.roll_no}</td>
                        <td className="p-3">{registration.email}</td>
                        <td className="p-3"><Badge variant="success">Verified</Badge></td>
                        <td className="p-3">{registration.email_sent ? <Badge variant="success">Sent</Badge> : <Badge variant="warning">Not Sent</Badge>}</td>
                        <td className="p-3">{registration.attendance?.length > 0 ? <Badge variant="success">Present</Badge> : <Badge variant="warning">Not Marked</Badge>}</td>
                        <td className="p-3"><div className="bg-white p-1 rounded-md inline-block"><QRCodeCanvas value={registration.qr_data} size={56} /></div></td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {registrations.length === 0 && <p className="text-[#b5b5b5] text-center py-8">No registrations yet.</p>}
        </motion.div>
      </div>
    </div>
  )
}
