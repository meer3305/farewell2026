'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium tracking-[0.08em] uppercase transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden',
  {
    variants: {
      variant: {
        default: 'border border-[#7a263f]/45 bg-gradient-to-br from-[#111111] via-[#171717] to-[#0f0f0f] text-white shadow-[0_16px_36px_rgba(0,0,0,0.36)] hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(122,38,63,0.26)] hover:border-[#7a263f]/80',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline: 'border border-white/20 bg-white/5 text-white shadow-sm hover:bg-white/10 hover:border-[#b8bec8]/55',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-white/10 hover:text-white',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-5',
        sm: 'h-8 px-3 text-[0.66rem]',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  const innerRef = React.useRef(null)

  const setRefs = (node) => {
    innerRef.current = node
    if (typeof ref === 'function') ref(node)
    else if (ref) ref.current = node
  }

  const handlePointerMove = (event) => {
    if (props.disabled) return
    const target = event.currentTarget
    const rect = target.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const px = ((x / rect.width) - 0.5) * 10
    const py = ((y / rect.height) - 0.5) * 10

    target.style.setProperty('--mx', `${x}px`)
    target.style.setProperty('--my', `${y}px`)
    target.style.setProperty('--tilt-x', `${px}deg`)
    target.style.setProperty('--tilt-y', `${-py}deg`)

    props.onPointerMove?.(event)
  }

  const resetPointer = (event) => {
    const target = event.currentTarget
    target.style.setProperty('--tilt-x', '0deg')
    target.style.setProperty('--tilt-y', '0deg')
    props.onPointerLeave?.(event)
  }

  const handlePointerDown = (event) => {
    const target = event.currentTarget
    const ripple = document.createElement('span')
    ripple.className = 'btn-ripple'
    const rect = target.getBoundingClientRect()
    ripple.style.left = `${event.clientX - rect.left}px`
    ripple.style.top = `${event.clientY - rect.top}px`
    target.appendChild(ripple)
    ripple.addEventListener('animationend', () => ripple.remove())
    props.onPointerDown?.(event)
  }

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }), 'btn-core')}
      ref={setRefs}
      {...props}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      onPointerDown={handlePointerDown}
    />
  )
})
Button.displayName = 'Button'

export { Button, buttonVariants }
