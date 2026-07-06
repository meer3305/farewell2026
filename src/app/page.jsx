'use client'

import { useState } from 'react'
import Image from 'next/image'
import { getSupabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const PAYMENT_QR_SRC = '/payment-qr-placeholder.svg'
const REGISTRATION_FEE = '₹200'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^(\+91)?[6-9]\d{9}$/

const FIELDS = [
  { name: 'name', label: 'Full Name', placeholder: 'Your answer', required: true },
  { name: 'section', label: 'Section', placeholder: 'Your answer', required: true },
  { name: 'roll_no', label: 'Roll Number', placeholder: 'Your answer', required: true },
]

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

function FormField({ id, label, required, error, hint, children }) {
  return (
    <div className="space-y-2 py-4 border-b border-border last:border-0">
      <Label htmlFor={id} className="text-sm font-normal text-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
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

      setMessage('Registration submitted. You will receive a QR code once payment is verified.')
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
    <div className="page-bg min-h-[calc(100vh-3.5rem)] py-6 px-4">
      <div className="mx-auto w-full max-w-2xl space-y-3">
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="h-2 bg-primary" />
          <div className="p-6 pb-4">
            <h1 className="text-3xl font-normal text-foreground">Freshers 2026 Registration</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Fill in your details and upload a payment screenshot to register.
            </p>
            <Separator className="mt-4" />
            <p className="mt-3 text-xs text-muted-foreground">
              <span className="text-destructive">*</span> Required
            </p>
          </div>
        </div>

        {message && (
          <Alert className="alert-success">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="h-2 bg-primary" />
            <div className="p-6">
              <h2 className="text-base font-medium text-foreground">Personal details</h2>
              <Separator className="my-4" />

            {FIELDS.map(({ name, label, placeholder, required }) => (
              <FormField key={name} id={name} label={label} required={required} error={fieldErrors[name]}>
                <input
                  id={name}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={placeholder}
                  required
                  className={cn('form-input', fieldErrors[name] && 'form-input-error')}
                />
              </FormField>
            ))}

            <FormField id="phone" label="Phone number" required error={fieldErrors.phone}>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Your answer"
                required
                className={cn('form-input', fieldErrors.phone && 'form-input-error')}
              />
            </FormField>

            <FormField
              id="email"
              label="Email"
              required
              error={fieldErrors.email}
              hint="Your entry QR code will be sent to this email."
            >
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Your answer"
                required
                className={cn('form-input', fieldErrors.email && 'form-input-error')}
              />
            </FormField>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="h-2 bg-primary" />
            <div className="p-6">
            <h2 className="text-base font-medium text-foreground">Payment</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Pay {REGISTRATION_FEE} via UPI and upload your screenshot.
            </p>
            <Separator className="my-4" />

            <div className="flex flex-col sm:flex-row gap-6">
              <div className="shrink-0">
                <p className="text-sm text-foreground mb-2">Scan to pay</p>
                <div className="w-[160px] h-[160px] rounded border border-border bg-secondary overflow-hidden">
                  <Image
                    src={PAYMENT_QR_SRC}
                    alt="UPI payment QR code"
                    width={160}
                    height={160}
                    className="object-cover"
                    priority
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  UPI: freshers2026@upi
                </p>
              </div>

              <div className="flex-1">
                <FormField id="payment" label="Payment screenshot" required>
                  {preview ? (
                    <div className="space-y-2">
                      <img src={preview} alt="Payment preview" className="max-h-36 rounded border border-border" />
                      <label htmlFor="payment" className="text-sm text-primary cursor-pointer hover:underline">
                        Change file
                      </label>
                    </div>
                  ) : (
                    <label
                      htmlFor="payment"
                      className="block text-sm text-muted-foreground cursor-pointer"
                    >
                      <span className="text-primary hover:underline">Add file</span>
                      <span> or drag and drop</span>
                    </label>
                  )}
                  <input
                    id="payment"
                    type="file"
                    accept="image/*"
                    onChange={handleFile}
                    className="mt-2 block w-full text-sm text-muted-foreground file:mr-3 file:rounded file:border file:border-border file:bg-secondary file:px-3 file:py-1 file:text-sm file:text-foreground"
                    required={!paymentFile}
                  />
                </FormField>
              </div>
            </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
