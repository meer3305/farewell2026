'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { getSupabase } from '@/lib/supabase'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { CalendarDays, Camera, Crown, MapPin, Music4, Network, QrCode, Utensils } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { EASE_PREMIUM, staggerChild, staggerParent } from '@/lib/motion'


const PAYMENT_QR_SRC =  "/payment.png"
const REGISTRATION_FEE = '₹1,400'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^(\+91)?[6-9]\d{9}$/

const FIELDS = [
  { name: 'name', label: 'Full Name', required: true },
  { name: 'section', label: 'Section', required: true },
  { name: 'roll_no', label: 'Roll Number', required: true },
]

const HIGHLIGHTS = [
  { icon: Utensils, title: 'Lunch Experience', text: 'An elegant afternoon menu crafted for celebration and nostalgia.' },
  { icon: Camera, title: 'Portrait Gallery', text: 'Curated photo zones with cinematic lighting and premium frames.' },
  { icon: Crown, title: 'Awards', text: 'Honoring journeys, milestones, and unforgettable contributions.' },
  { icon: Music4, title: 'Music Curation', text: 'A soundtrack for goodbye moments and new beginnings.' },
  { icon: Network, title: 'Networking', text: 'One final room full of stories, mentors, and future collaborations.' },
  { icon: QrCode, title: 'QR Entry', text: 'Seamless premium entry with secure QR-based check-in.' },
]

const STORY = [
  { year: 'Year 1', text: 'New hallways, new friendships, and the first spark of belonging.' },
  { year: 'Year 2', text: 'Late nights, lab deadlines, and confidence built one challenge at a time.' },
  { year: 'Year 3', text: 'Projects, leadership, and lessons that shaped the core identity.' },
  { year: 'Year 4', text: 'Final submissions, final photos, final hugs before new paths unfold.' },
  { year: 'Epilogue', text: 'The end of one story. The beginning of another.' },
]

const EVENT_DATE = new Date('2026-07-11T10:00:00+05:30').getTime()

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

function Reveal({ children, className }) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 26, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.24 }}
      transition={{ duration: 0.75, ease: EASE_PREMIUM }}
    >
      {children}
    </motion.div>
  )
}

function Countdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 })

  useEffect(() => {
    const tick = () => {
      const now = Date.now()
      const diff = Math.max(0, EVENT_DATE - now)
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const mins = Math.floor((diff / (1000 * 60)) % 60)
      const secs = Math.floor((diff / 1000) % 60)
      setTimeLeft({ days, hours, mins, secs })
    }

    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [])

  const units = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.mins },
    { label: 'Seconds', value: timeLeft.secs },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {units.map((unit) => (
        <motion.div
          key={unit.label}
          className="floating-card p-5 text-center"
          whileHover={{ y: -5, rotateX: 4, rotateY: 2 }}
          transition={{ type: 'spring', stiffness: 220, damping: 20 }}
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={`${unit.label}-${unit.value}`}
              className="number-font text-4xl font-semibold text-white drop-shadow-[0_0_14px_rgba(212,175,55,0.35)]"
              initial={{ opacity: 0, y: -10, rotateX: 40 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, y: 10, rotateX: -30 }}
              transition={{ duration: 0.26, ease: EASE_PREMIUM }}
            >
              {String(unit.value).padStart(2, '0')}
            </motion.p>
          </AnimatePresence>
          <p className="mt-2 text-xs uppercase tracking-[0.26em] text-[#b5b5b5]">{unit.label}</p>
        </motion.div>
      ))}
    </div>
  )
}

function FormField({ id, label, required, error, hint, floating = true, children }) {
  return (
    <div className="space-y-2 py-4 border-b border-white/10 last:border-0">
      {floating ? (
        <div className="floating-field">
          {children}
          <Label htmlFor={id} className="floating-label">
            {label}
            {required && <span className="ml-1 text-[#7a263f]">*</span>}
          </Label>
        </div>
      ) : (
        <>
          <Label htmlFor={id} className="text-sm font-medium text-white/90">
            {label}
            {required && <span className="ml-1 text-[#7a263f]">*</span>}
          </Label>
          {children}
        </>
      )}
      {hint && <p className="text-xs text-[#b5b5b5]">{hint}</p>}
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  )
}

export default function RegisterPage() {
  const [typed, setTyped] = useState('')
  const [form, setForm] = useState({ name: '', section: '', roll_no: '', phone: '', email: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [paymentFile, setPaymentFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(null)
  const reduceMotion = useReducedMotion()
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const heroX = useSpring(useTransform(pointerX, [-0.5, 0.5], [-18, 18]), { stiffness: 120, damping: 20 })
  const heroY = useSpring(useTransform(pointerY, [-0.5, 0.5], [-12, 12]), { stiffness: 120, damping: 20 })

  useEffect(() => {
    const text = 'The Final Chapter Begins.'
    let index = 0
    const timer = window.setInterval(() => {
      index += 1
      setTyped(text.slice(0, index))
      if (index >= text.length) window.clearInterval(timer)
    }, 80)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (reduceMotion) return undefined

    gsap.registerPlugin(ScrollTrigger)

    const context = gsap.context(() => {
      const sections = gsap.utils.toArray('.reveal-section')
      sections.forEach((section) => {
        const type = section.dataset.reveal || 'default'
        const config = {
          hero: { from: { y: 34, opacity: 0, filter: 'blur(12px)' }, to: { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.85, ease: 'power3.out' } },
          default: { from: { y: 48, opacity: 0, filter: 'blur(10px)' }, to: { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power3.out' } },
          timeline: { from: { x: -40, opacity: 0 }, to: { x: 0, opacity: 1, duration: 0.9, ease: 'power2.out' } },
          cards: { from: { scale: 0.95, opacity: 0, y: 34 }, to: { scale: 1, opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' } },
          venue: { from: { y: 64, opacity: 0, clipPath: 'inset(0 0 90% 0)' }, to: { y: 0, opacity: 1, clipPath: 'inset(0 0 0% 0)', duration: 1, ease: 'power3.out' } },
          register: { from: { y: 55, opacity: 0 }, to: { y: 0, opacity: 1, duration: 1.05, ease: 'power3.out' } },
        }[type] || { from: { y: 30, opacity: 0 }, to: { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' } }

        gsap.fromTo(section, config.from, {
          ...config.to,
          scrollTrigger: {
            trigger: section,
            start: 'top 82%',
          },
        })
      })

      gsap.fromTo(
        '.story-year',
        { x: -34, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '#story',
            start: 'top 74%',
          },
        }
      )

      gsap.to('.venue-parallax', {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: {
          trigger: '#venue',
          scrub: true,
          start: 'top bottom',
          end: 'bottom top',
        },
      })
    })

    return () => context.revert()
  }, [reduceMotion])

  const onHeroPointerMove = (event) => {
    if (reduceMotion) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    pointerX.set(x)
    pointerY.set(y)
  }

  const onHeroPointerLeave = () => {
    pointerX.set(0)
    pointerY.set(0)
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
  }

  const handleBlur = (event) => {
    const { name, value } = event.target
    setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
  }

  const handleFile = (event) => {
    const file = event.target.files[0]
    if (file) {
      setPaymentFile(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const formProgress = useMemo(() => {
    const values = Object.values(form)
    const complete = values.filter(Boolean).length + (paymentFile ? 1 : 0)
    return Math.round((complete / (values.length + 1)) * 100)
  }, [form, paymentFile])

  const handleSubmit = async (event) => {
    event.preventDefault()
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
        ...form,
        payment_screenshot_url: urlData.publicUrl,
      })
      if (dbError) throw dbError

      setMessage('Registration submitted. You will receive a QR code once payment is verified.')
      setForm({ name: '', section: '', roll_no: '', phone: '', email: '' })
      setFieldErrors({})
      setPaymentFile(null)
      setPreview(null)
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setLoading(false)
    }
  }

  const scrollTo = (id) => {
    const target = document.getElementById(id)
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="page-bg pb-12">
      <section className="section-shell min-h-[90vh] flex flex-col justify-center py-16 reveal-section" data-reveal="hero" onPointerMove={onHeroPointerMove} onPointerLeave={onHeroPointerLeave}>
        <motion.p className="premium-kicker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.12, ease: EASE_PREMIUM }}>
          Official Farewell Celebration
        </motion.p>

        <motion.div className="relative mt-5 max-w-5xl" style={{ x: heroX, y: heroY }}>
          <h1 className="display-title text-white">
            {"EPILOGUE'26".split('').map((letter, index) => (
              <motion.span
                key={`${letter}-${index}`}
                className="inline-block"
                initial={{ opacity: 0, y: 40, rotateX: 55 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.52, delay: 0.05 * index, ease: EASE_PREMIUM }}
              >
                {letter}
              </motion.span>
            ))}
          </h1>
          <motion.div className="pointer-events-none absolute -z-10 h-[220px] w-[220px] rounded-full bg-[#7a263f]/20 blur-[90px]" style={{ x: heroX, y: heroY }} aria-hidden="true" />

          <p className="mt-6 text-2xl sm:text-4xl text-[#f5f5f5] min-h-[2.5rem]">{typed}</p>
          <p className="mt-4 text-base sm:text-xl text-[#b5b5b5] max-w-2xl leading-relaxed">
            Four unforgettable years. One unforgettable farewell.
          </p>

          <motion.div className="mt-10 flex flex-wrap gap-3" {...staggerParent({ stagger: 0.08 })}>
            <motion.div {...staggerChild({ y: 14 })}>
              <Button className="magnetic-btn" onClick={() => scrollTo('register')}>Reserve Your Seat</Button>
            </motion.div>
            <motion.div {...staggerChild({ y: 14 })}>
              <Button variant="outline" className="magnetic-btn secondary" onClick={() => scrollTo('story')}>Explore</Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      <section id="story" className="section-shell py-20 reveal-section" data-reveal="timeline">
        <Reveal>
          <p className="premium-kicker">The Story</p>
          <h2 className="section-title mt-3">A Timeline of Us</h2>
          <p className="section-subtitle mt-4">Every year wrote a chapter. Tonight, we turn the final page together.</p>
        </Reveal>

        <div className="relative mt-10 grid gap-4 pl-8">
          <div className="timeline-line" />
          {STORY.map((item) => (
            <motion.div key={item.year} className="story-year floating-card p-5" whileHover={{ x: 6 }}>
              <div className="flex items-center gap-3">
                <span className="timeline-dot" />
                <h3 className="text-2xl text-white">{item.year}</h3>
              </div>
              <p className="mt-2 text-[#b5b5b5] leading-relaxed">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="section-shell py-20 reveal-section" data-reveal="cards">
        <Reveal>
          <p className="premium-kicker">Event Highlights</p>
          <h2 className="section-title mt-3">Designed To Be Remembered</h2>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
            <motion.article key={title} className="floating-card p-5" whileHover={{ y: -8, rotateX: 5, rotateY: -4 }} transition={{ type: 'spring', stiffness: 220, damping: 22 }}>
              <div className="w-10 h-10 rounded-full border border-white/20 bg-white/5 grid place-items-center text-[#b8bec8]">
                <Icon size={18} />
              </div>
              <h3 className="mt-5 text-2xl">{title}</h3>
              <p className="mt-2 text-sm text-[#b5b5b5] leading-relaxed">{text}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="section-shell py-20 reveal-section" data-reveal="countdown">
        <Reveal>
          <p className="premium-kicker">Countdown</p>
          <h2 className="section-title mt-3">Until The Final Celebration</h2>
        </Reveal>
        <div className="mt-9">
          <Countdown />
        </div>
      </section>

      <section id="venue" className="section-shell py-20 reveal-section" data-reveal="venue">
        <Reveal>
          <p className="premium-kicker">Venue</p>
          <h2 className="section-title mt-3">Where Memories Gather One Last Time</h2>
        </Reveal>

        <div className="glass-panel mt-10 p-5 sm:p-8 grid lg:grid-cols-[1fr_1.2fr] gap-6">
          <div>
            <h3 className="text-3xl">Jewel Banquets</h3>
            <p className="mt-3 text-[#b5b5b5]">A curated ambience crafted for speeches, applause, portraits, and goodbyes.</p>
            <div className="mt-5 space-y-2 text-sm text-white/90">
              <p className="inline-flex items-center gap-2"><MapPin size={15} /> Jewel Banquets, Mehdipatnam</p>
              <p className="inline-flex items-center gap-2"><CalendarDays size={15} /> 11 July, 2026 · 10:00 AM onwards</p>
            </div>
            <a href="https://www.google.com/maps/search/?api=1&query=Jewel%20Banquets,%20Mehdipatnam" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-6 magnetic-btn secondary">
              Directions
            </a>
          </div>

          <div className="venue-parallax overflow-hidden rounded-2xl border border-white/15 min-h-[280px]">
            <iframe
              title="Event location"
              src="https://maps.google.com/maps?q=Jewel%20Banquets,%20Mehdipatnam&t=&z=16&ie=UTF8&iwloc=&output=embed"
              className="h-full min-h-[280px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      <section className="section-shell py-20 reveal-section" data-reveal="cta">
        <div className="glass-panel p-8 sm:p-12 text-center">
          <p className="premium-kicker">Registration</p>
          <h2 className="section-title mt-3">Reserve Your Final Memory.</h2>
          <p className="section-subtitle mt-4 mx-auto">The last ceremony of this chapter deserves a graceful presence. Confirm your seat below.</p>
          <Button className="magnetic-btn mt-8" onClick={() => scrollTo('register')}>Register Now</Button>
        </div>
      </section>

      <section id="register" className="section-shell py-20 reveal-section" data-reveal="register">
        <div className="glass-panel p-6 sm:p-9">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="premium-kicker">Registration Form</p>
              <h2 className="section-title mt-2">EPILOGUE'26 Entry</h2>
            </div>
            <div className="w-full max-w-[260px]">
              <div className="flex justify-between text-xs text-[#b5b5b5] mb-2"><span>Progress</span><span>{formProgress}%</span></div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-[#c9ced6] via-[#7a263f] to-[#e8ccd4]" animate={{ width: `${formProgress}%` }} />
              </div>
            </div>
          </div>

          <div className="glass-divider my-7" />

          {message && (
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
              <Alert className="alert-success">
                <AlertDescription>
                  <span className="inline-flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#7a263f]/25 border border-[#7a263f]/45 grid place-items-center">✓</span>
                    {message}
                  </span>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
          {error && (
            <Alert variant="destructive" className="mb-5">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1.05fr_0.95fr] gap-7">
            <div>
              <h3 className="text-xl">Your Details</h3>
              {FIELDS.map(({ name, label, required }) => (
                <FormField key={name} id={name} label={label} required={required} error={fieldErrors[name]}>
                  <input
                    id={name}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder=" "
                    aria-label={label}
                    required
                    className={cn('form-input', fieldErrors[name] && 'form-input-error')}
                  />
                </FormField>
              ))}

              <FormField id="phone" label="Phone Number" required error={fieldErrors.phone}>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder=" "
                  aria-label="Phone Number"
                  required
                  className={cn('form-input', fieldErrors.phone && 'form-input-error')}
                />
              </FormField>

              <FormField id="email" label="Email" required error={fieldErrors.email} hint="Your entry QR code will be sent to this email once verified.">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder=" "
                  aria-label="Email"
                  required
                  className={cn('form-input', fieldErrors.email && 'form-input-error')}
                />
              </FormField>
            </div>

            <div>
              <h3 className="text-xl">Payment</h3>
              <p className="text-sm text-[#b5b5b5] mt-2">Pay {REGISTRATION_FEE} via UPI and upload your screenshot.</p>

              <div className="floating-card mt-5 p-4">
                <p className="text-sm mb-2">Scan to pay</p>
                <div className="w-[180px] h-[180px] rounded-xl border border-white/15 bg-[#0f0f0f] overflow-hidden">
                  <img src={PAYMENT_QR_SRC} alt="UPI payment QR code" width={180} height={180} className="object-cover" priority />
                </div>
              </div>

              <FormField id="payment" label="Payment Screenshot" required floating={false}>
                {preview ? (
                  <div className="space-y-2">
                    <img src={preview} alt="Payment preview" className="max-h-44 rounded-xl border border-white/15" />
                    <label htmlFor="payment" className="text-sm text-[#b8bec8] cursor-pointer hover:underline">Change file</label>
                  </div>
                ) : (
                  <label htmlFor="payment" className="block text-sm text-[#b5b5b5] cursor-pointer">
                    <span className="text-[#b8bec8] hover:underline">Add file</span>
                    <span> or drag and drop</span>
                  </label>
                )}
                <input
                  id="payment"
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  className="mt-2 block w-full text-sm text-[#b5b5b5] file:mr-3 file:rounded-full file:border file:border-white/20 file:bg-white/10 file:px-3 file:py-1.5 file:text-sm file:text-white"
                  required={!paymentFile}
                />
              </FormField>

              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={loading} className="min-w-36">
                  {loading ? 'Submitting...' : 'Submit Registration'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}
