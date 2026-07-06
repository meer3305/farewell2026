'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

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
    if (!localStorage.getItem('admin_authenticated')) router.push('/admin/login')
  }, [router])

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
    } catch (err) {
      setAttendanceMsg(err.message)
      setMsgType('error')
    }
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    if (manualInput.trim()) markAttendance(manualInput.trim())
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background p-4 md:p-6">
      <Card className="max-w-lg mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Attendance Scanner</CardTitle>
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/dashboard')}>Dashboard</Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <h3 className="font-medium">Scan QR Code</h3>
            {!scanning ? <Button onClick={startScanner}>Start Camera Scanner</Button> : <Button variant="outline" onClick={stopScanner}>Stop Scanner</Button>}
            <div id="qr-reader" className="mx-auto max-w-sm" />
            {cameraError && <p className="text-red-600 dark:text-red-400 text-sm">{cameraError}</p>}
          </div>

          <hr className="border-t" />

          <div className="space-y-4">
            <h3 className="font-medium">Or Enter QR Data Manually</h3>
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="qr-input">QR Data</Label>
                <Input id="qr-input" value={manualInput} onChange={e => setManualInput(e.target.value)} placeholder="Paste QR data" />
              </div>
              <Button type="submit" className="w-full">Mark Attendance</Button>
            </form>
          </div>

          {attendanceMsg && (
            <div className={`p-3 rounded-md text-sm ${msgType === 'error' ? 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300' : 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300'}`}>
              {attendanceMsg}
            </div>
          )}

          {lastAttended && (
            <div className="bg-muted p-4 rounded-lg space-y-1">
              <p className="font-medium">Last Attendance</p>
              <p className="text-sm">Name: {lastAttended.name}</p>
              <p className="text-sm">Section: {lastAttended.section}</p>
              <p className="text-sm">Email: {lastAttended.email}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
