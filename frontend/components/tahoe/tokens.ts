/**
 * macOS Tahoe Design Tokens
 * Based on translucent materials, elevation system, and refined typography
 */

// Surface layers - translucent materials with backdrop blur
export const surfaces = {
    ultraThin: 'bg-white/40 dark:bg-black/30 backdrop-blur-xl',
    thin: 'bg-white/60 dark:bg-black/50 backdrop-blur-2xl',
    regular: 'bg-white/80 dark:bg-black/70 backdrop-blur-2xl',
    thick: 'bg-white/95 dark:bg-black/90 backdrop-blur-3xl',
} as const;

// Elevation system - shadows for depth
export const elevation = {
    flat: 'shadow-none',
    raised: 'shadow-[0_1px_3px_rgba(0,0,0,0.08)]',
    floating: 'shadow-[0_8px_32px_rgba(0,0,0,0.12)]',
    overlay: 'shadow-[0_16px_64px_rgba(0,0,0,0.16)]',
    modal: 'shadow-[0_24px_96px_rgba(0,0,0,0.24)]',
} as const;

// Border system
export const borders = {
    subtle: 'border-black/5 dark:border-white/5',
    default: 'border-black/10 dark:border-white/10',
    strong: 'border-black/20 dark:border-white/20',
} as const;

// Border radius
export const radius = {
    sm: 'rounded-lg',   // 8px
    md: 'rounded-xl',   // 12px
    lg: 'rounded-2xl',  // 16px
} as const;

// Typography
export const text = {
    primary: 'text-black dark:text-white',
    secondary: 'text-black/80 dark:text-white/80',
    tertiary: 'text-black/60 dark:text-white/60',
    muted: 'text-black/50 dark:text-white/50',
    disabled: 'text-black/40 dark:text-white/40',
} as const;

// Interactive states
export const interactive = {
    hover: 'hover:bg-black/5 dark:hover:bg-white/5',
    active: 'active:bg-black/10 dark:active:bg-white/10',
    focus: 'focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
} as const;

// Status colors
export const status = {
    success: 'text-green-600 bg-green-500/10',
    warning: 'text-yellow-600 bg-yellow-500/10',
    error: 'text-red-600 bg-red-500/10',
    info: 'text-blue-600 bg-blue-500/10',
} as const;
