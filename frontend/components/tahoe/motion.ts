/**
 * macOS Tahoe Motion Configuration
 * Optimized for 60fps animations with natural feel
 */

// Spring physics for natural motion
export const spring = {
    default: { type: 'spring' as const, stiffness: 300, damping: 30 },
    gentle: { type: 'spring' as const, stiffness: 200, damping: 25 },
    snappy: { type: 'spring' as const, stiffness: 400, damping: 35 },
    quick: { type: 'spring' as const, stiffness: 500, damping: 30 },
} as const;

// Standard CSS transitions (for non-framer components)
export const transitions = {
    instant: 'duration-100',
    fast: 'duration-150',
    normal: 'duration-200',
    slow: 'duration-300',
} as const;

// Framer Motion animation variants
export const animations = {
    fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
    },
    slideUp: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
    },
    scaleIn: {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
    },
} as const;
