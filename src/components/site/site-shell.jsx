'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Lenis from 'lenis'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { AudioLines, AudioWaveform, Compass, ShieldCheck } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

function LoadingScreen({ done }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setProgress((value) => {
        const next = value + Math.max(2, (100 - value) * 0.08)
        return next >= 100 ? 100 : next
      })
    }, 70)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (progress >= 100) {
      const timeout = window.setTimeout(() => done(), 340)
      return () => window.clearTimeout(timeout)
    }
  }, [progress, done])

  return (
    <motion.div
      className="loader-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: [0.2, 1, 0.2, 1] } }}
      aria-live="polite"
      aria-label="Loading EPILOGUE website"
    >
      <div className="loader-content">
        <h1 className="loader-word" aria-label="EPILOGUE 26">
          {"EPILOGUE'26".split('').map((char, index) => (
            <motion.span
              key={`${char}-${index}`}
              initial={{ y: 18, opacity: 0, filter: 'blur(6px)' }}
              animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.64, delay: index * 0.05 }}
            >
              {char}
            </motion.span>
          ))}
        </h1>
        <p className="loader-tagline">The End of One Story. The Beginning of Another.</p>
        <div className="loader-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
          <motion.div
            className="loader-progress-bar"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.24, ease: 'linear' }}
          />
        </div>
      </div>
    </motion.div>
  )
}

function CinematicBackground() {
  const particles = useMemo(() => Array.from({ length: 18 }, (_, i) => i + 1), [])

  return (
    <div className="cinematic-bg" aria-hidden="true">
      <div className="bg-stars" />
      <div className="bg-aurora bg-aurora-left" />
      <div className="bg-aurora bg-aurora-right" />
      <div className="bg-noise" />
      <div className="bg-orbs" />
      <div className="bg-particles">
        {particles.map((id) => (
          <span key={id} className={`particle particle-${id}`} />
        ))}
      </div>
      <div className="bg-vignette" />
    </div>
  )
}

function ScrollProgressBar({ progress }) {
  return (
    <div className="scroll-progress" aria-hidden="true">
      <motion.div
        className="scroll-progress-bar"
        animate={{ height: `${progress}%` }}
        transition={{ duration: 0.08, ease: 'linear' }}
      />
    </div>
  )
}

function CustomCursor() {
  const reduceMotion = useReducedMotion()
  const [enabled, setEnabled] = useState(false)
  const [active, setActive] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    setEnabled(canHover)
    if (!canHover) return

    const onMove = (event) => {
      setPosition({ x: event.clientX, y: event.clientY })
    }

    const onDown = () => setActive(true)
    const onUp = () => setActive(false)

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  if (!enabled) return null

  return (
    <>
      <motion.div
        className="cursor-dot"
        animate={reduceMotion ? {} : { x: position.x - 4, y: position.y - 4, scale: active ? 0.8 : 1 }}
      />
      <motion.div
        className="cursor-ring"
        animate={reduceMotion ? {} : { x: position.x - 16, y: position.y - 16, scale: active ? 1.25 : 1 }}
        transition={{ type: 'spring', damping: 24, stiffness: 260, mass: 0.2 }}
      />
    </>
  )
}

function SiteNav({ hidden, soundEnabled, setSoundEnabled }) {
  const pathname = usePathname()

  return (
    <motion.header
      className={`site-nav ${hidden ? 'site-nav-hidden' : ''}`}
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.2, 1, 0.2, 1] }}
    >
      <div className="site-nav-inner">
        <Link href="/" className="brand-mark" aria-label="EPILOGUE 26 home">
          <span className="brand-dot" />
          <span className="brand-text">EPILOGUE'26</span>
        </Link>

        <nav className="site-links" aria-label="Main navigation">
          <Link href="/" className={pathname === '/' ? 'active' : ''}>Register</Link>
          <Link href="/status" className={pathname === '/status' ? 'active' : ''}>Status</Link>
          <Link href="/admin/login" className={pathname.startsWith('/admin') ? 'active' : ''}>Admin</Link>
        </nav>

        <button
          type="button"
          className="sound-toggle"
          onClick={() => setSoundEnabled((value) => !value)}
          aria-label={soundEnabled ? 'Mute ambient sound' : 'Unmute ambient sound'}
          title="Ambient sound placeholder"
        >
          {soundEnabled ? <AudioWaveform size={16} /> : <AudioLines size={16} />}
        </button>
      </div>
    </motion.header>
  )
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div>
          <p className="site-footer-brand">EPILOGUE'26</p>
          <p className="site-footer-copy">Made with love by your juniors</p>
        </div>
        <div className="site-footer-links" aria-label="Social links">
          <a href="#" aria-label="Instagram"><Compass size={16} /></a>
          <a href="#" aria-label="LinkedIn"><ShieldCheck size={16} /></a>
        </div>
      </div>
    </footer>
  )
}

export function SiteShell({ children }) {
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()
  const [ready, setReady] = useState(false)
  const [hiddenNav, setHiddenNav] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [progress, setProgress] = useState(0)
  const lastY = useRef(0)
  const navLock = useRef(false)

  useEffect(() => {
    if (reduceMotion) {
      setReady(true)
    }
  }, [reduceMotion])

  useEffect(() => {
    if (reduceMotion) return undefined

    gsap.registerPlugin(ScrollTrigger)

    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      smoothTouch: false,
      lerp: 0.08,
    })

    const update = (time) => {
      lenis.raf(time * 1000)
    }

    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.off('scroll', ScrollTrigger.update)
      gsap.ticker.remove(update)
      lenis.destroy()
    }
  }, [reduceMotion])

  useEffect(() => {
    const timeout = window.setTimeout(() => ScrollTrigger.refresh(), 120)
    return () => window.clearTimeout(timeout)
  }, [pathname])

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      const max = document.body.scrollHeight - window.innerHeight
      const nextProgress = max > 0 ? (y / max) * 100 : 0
      setProgress(nextProgress)

      if (y < 16) {
        setHiddenNav(false)
      } else {
        const delta = y - lastY.current
        if (!navLock.current && Math.abs(delta) > 5) {
          setHiddenNav(delta > 0)
          navLock.current = true
          window.setTimeout(() => {
            navLock.current = false
          }, 120)
        }
      }

      lastY.current = y
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="site-shell">
      <CinematicBackground />
      <CustomCursor />
      <ScrollProgressBar progress={progress} />
      <SiteNav hidden={hiddenNav} soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} />

      <AnimatePresence>
        {!ready && !reduceMotion && <LoadingScreen done={() => setReady(true)} />}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          className="site-main"
          initial={reduceMotion ? false : { opacity: 0, filter: 'blur(10px)', scale: 0.99 }}
          animate={reduceMotion ? {} : { opacity: 1, filter: 'blur(0px)', scale: 1 }}
          exit={reduceMotion ? {} : { opacity: 0, filter: 'blur(8px)', scale: 1.01 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.main>
      </AnimatePresence>

      <SiteFooter />
    </div>
  )
}
