'use client'

import { useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^(\+91)?[6-9]\d{9}$/

function validateField(name, value) {
  switch (name) {
    case 'email':
      if (!value) return 'Email is required'
      if (!EMAIL_RE.test(value)) return 'Invalid email address'
      return ''
    case 'phone':
      if (!value) return 'Phone is required'
      if (!PHONE_RE.test(value)) return 'Enter a valid 10-digit Indian phone number'
      return ''
    case 'name': return !value ? 'Name is required' : ''
    case 'section': return !value ? 'Section is required' : ''
    case 'roll_no': return !value ? 'Roll No is required' : ''
    default: return ''
  }
}

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', section: '', roll_no: '', phone: '', email: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [paymentFile, setPaymentFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
    setFieldErrors(p => ({ ...p, [name]: validateField(name, value) }))
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setFieldErrors(p => ({ ...p, [name]: validateField(name, value) }))
  }

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPaymentFile(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')
    const supabase = getSupabase()

    try {
      if (!paymentFile) throw new Error('Upload a payment screenshot')

      const errors = {}
      for (const key of Object.keys(form)) errors[key] = validateField(key, form[key])
      setFieldErrors(errors)
      if (Object.values(errors).some(Boolean)) throw new Error('Fix the errors above')

      const fileExt = paymentFile.name.split('.').pop()
      const filePath = `${Date.now()}_${form.email.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('payment-screenshots')
        .upload(filePath, paymentFile)
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('payment-screenshots').getPublicUrl(filePath)

      const { error: dbError } = await supabase.from('registrations').insert({
        ...form, payment_screenshot_url: urlData.publicUrl,
      })
      if (dbError) throw dbError

      setMessage('Registration submitted! You will receive a QR code once payment is verified.')
      setForm({ name: '', section: '', roll_no: '', phone: '', email: '' })
      setFieldErrors({})
      setPaymentFile(null)
      setPreview(null)
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
          <CardTitle className="text-2xl">Freshers 2026</CardTitle>
          <CardDescription>Fill in your details and upload payment screenshot</CardDescription>
        </CardHeader>
        <CardContent>
          {message && <div className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 p-3 rounded-md text-sm mb-4">{message}</div>}
          {error && <div className="bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 p-3 rounded-md text-sm mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {['name', 'section', 'roll_no'].map(f => (
              <div key={f} className="space-y-2">
                <Label htmlFor={f}>{f.charAt(0).toUpperCase() + f.slice(1).replace('_', ' ')}</Label>
                <Input id={f} name={f} value={form[f]} onChange={handleChange} onBlur={handleBlur} required />
                {fieldErrors[f] && <p className="text-xs text-red-500">{fieldErrors[f]}</p>}
              </div>
            ))}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} onBlur={handleBlur} required placeholder="+919XXXXXXXXX or 98XXXXXXXX" />
              {fieldErrors.phone && <p className="text-xs text-red-500">{fieldErrors.phone}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} onBlur={handleBlur} required />
              {fieldErrors.email && <p className="text-xs text-red-500">{fieldErrors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment">Upload Payment Screenshot</Label>
              <Input id="payment" type="file" accept="image/*" onChange={handleFile} required />
              {preview && <img src={preview} alt="Preview" className="mt-2 max-w-[200px] rounded-md border" />}
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Submitting...' : 'Register'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
