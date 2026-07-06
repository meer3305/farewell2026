'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { EASE_PREMIUM, fadeUp } from '@/lib/motion'

export default function ScanPage() {
  const [attendanceMsg, setAttendanceMsg] = useState('')
  const [msgType, setMsgType] = useState('')
  const [manualInput, setManualInput] = useState('')
  const [scanning, setScanning] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [lastAttended, setLastAttended] = useState(null)
  const router = useRouter()
  const html5QrCodeRef = useRef(null)

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        try { html5QrCodeRef.current.stop() } catch {}
      }
    }
  }, [])

  const startScanner = async () => {
    setScanning(true)
    setCameraError('')
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      const scanner = new Html5Qrcode('qr-reader')
      html5QrCodeRef.current = scanner
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => { markAttendance(decodedText); scanner.stop(); setScanning(false) },
        () => {}
      )
    } catch {
      setCameraError('Camera access denied. Use manual input instead.')
      setScanning(false)
    }
  }

  const stopScanner = () => {
    if (html5QrCodeRef.current) html5QrCodeRef.current.stop().catch(() => {})
    setScanning(false)
  }

  const markAttendance = async (qrData) => {
    setAttendanceMsg('')
    setLastAttended(null)
    setMsgType('')

    try {
      const res = await fetch('/api/mark-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_data: qrData }),
      })
      const result = await res.json()

      if (!res.ok) throw new Error(result.error)

      setLastAttended(result.registration)
      setAttendanceMsg(`Attendance marked: ${result.registration.name} (${result.registration.section})`)
      setMsgType('success')
      setManualInput('')
    } catch (scanError) {
      setAttendanceMsg(scanError.message)
      setMsgType('error')
    }
  }

  const handleManualSubmit = (event) => {
    event.preventDefault()
    if (manualInput.trim()) markAttendance(manualInput.trim())
  }

  return (
    <div className="page-bg px-4 py-8">
      <div className="section-shell max-w-3xl">
        <motion.div
          className="glass-panel p-6 sm:p-8"
          {...fadeUp({ duration: 0.52, y: 18 })}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="premium-kicker">Attendance Scanner</p>
              <h1 className="text-4xl mt-2">Live Entry Verification</h1>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push('/admin/dashboard')}>Dashboard</Button>
          </div>

          <div className="mt-7 grid gap-6 sm:grid-cols-2">
            <div className="floating-card p-5 text-center">
              <h2 className="text-xl">Scan QR Code</h2>
              <p className="mt-2 text-sm text-[#b5b5b5]">Use camera for instant attendance marking.</p>
              <div className="mt-4">
                {!scanning ? <Button onClick={startScanner}>Start Camera Scanner</Button> : <Button variant="outline" onClick={stopScanner}>Stop Scanner</Button>}
              </div>
              <div id="qr-reader" className="mx-auto mt-4 max-w-sm rounded-xl overflow-hidden" />
              {cameraError && <p className="text-red-300 text-sm mt-3">{cameraError}</p>}
            </div>

            <div className="floating-card p-5">
              <h2 className="text-xl">Manual Check-In</h2>
              <p className="mt-2 text-sm text-[#b5b5b5]">Paste QR payload if camera is unavailable.</p>
              <form onSubmit={handleManualSubmit} className="mt-4 space-y-3">
                <div className="floating-field">
                <input
                  id="qr-input"
                  value={manualInput}
                  onChange={(event) => setManualInput(event.target.value)}
                  placeholder=" "
                  className="form-input"
                />
                  <label htmlFor="qr-input" className="floating-label">QR Data</label>
                </div>
                <Button type="submit" className="w-full">Mark Attendance</Button>
              </form>
            </div>
          </div>

          {attendanceMsg && (
            <motion.div
              className={`mt-5 rounded-xl px-4 py-3 text-sm ${msgType === 'error' ? 'border border-red-500/40 bg-red-500/10 text-red-200' : 'border border-[#7a263f]/40 bg-[#7a263f]/10 text-[#f0d8df]'}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, ease: EASE_PREMIUM }}
            >
              {attendanceMsg}
            </motion.div>
          )}

          {lastAttended && (
            <div className="floating-card mt-5 p-4 space-y-1">
              <p className="text-lg">Last Attendance</p>
              <p className="text-sm">Name: {lastAttended.name}</p>
              <p className="text-sm">Section: {lastAttended.section}</p>
              <p className="text-sm">Email: {lastAttended.email}</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
