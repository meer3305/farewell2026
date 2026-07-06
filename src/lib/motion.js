export const EASE_PREMIUM = [0.22, 1, 0.36, 1]

export const fadeUp = ({ duration = 0.7, delay = 0, y = 22 } = {}) => ({
  initial: { opacity: 0, y, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration, delay, ease: EASE_PREMIUM },
})

export const staggerParent = ({ stagger = 0.1, delayChildren = 0 } = {}) => ({
  initial: 'hidden',
  animate: 'show',
  variants: {
    hidden: {},
    show: {
      transition: {
        staggerChildren: stagger,
        delayChildren,
      },
    },
  },
})

export const staggerChild = ({ y = 18, duration = 0.55 } = {}) => ({
  variants: {
    hidden: { opacity: 0, y, filter: 'blur(8px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration, ease: EASE_PREMIUM } },
  },
})
