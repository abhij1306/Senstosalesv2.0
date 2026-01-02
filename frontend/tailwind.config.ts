import type { Config } from 'tailwindcss';

const config: Config = {
    darkMode: 'class',
    content: [
        './app/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './lib/**/*.{ts,tsx}',
    ],
    theme: {
        extend: {
            /* ==========================================
               TYPOGRAPHY
               ========================================== */
            fontFamily: {
                display: ['var(--font-display)'],
                text: ['var(--font-text)'],
                mono: ['var(--font-mono)'],
                sans: ['var(--font-text)'], // Default
            },

            fontSize: {
                'caption-2': ['var(--text-caption-2)', { lineHeight: 'var(--leading-normal)' }],
                'caption-1': ['var(--text-caption-1)', { lineHeight: 'var(--leading-normal)' }],
                'footnote': ['var(--text-footnote)', { lineHeight: 'var(--leading-normal)' }],
                'subhead': ['var(--text-subhead)', { lineHeight: 'var(--leading-normal)' }],
                'callout': ['var(--text-callout)', { lineHeight: 'var(--leading-relaxed)' }],
                'body': ['var(--text-body)', { lineHeight: 'var(--leading-relaxed)' }],
                'headline': ['var(--text-headline)', { lineHeight: 'var(--leading-normal)' }],
                'title-3': ['var(--text-title-3)', { lineHeight: 'var(--leading-snug)' }],
                'title-2': ['var(--text-title-2)', { lineHeight: 'var(--leading-snug)' }],
                'title-1': ['var(--text-title-1)', { lineHeight: 'var(--leading-tight)' }],
                'large-title': ['var(--text-large-title)', { lineHeight: 'var(--leading-tight)' }],
            },

            fontWeight: {
                ultralight: 'var(--font-ultralight)',
                thin: 'var(--font-thin)',
                light: 'var(--font-light)',
                regular: 'var(--font-regular)',
                medium: 'var(--font-medium)',
                semibold: 'var(--font-semibold)',
                bold: 'var(--font-bold)',
            },

            letterSpacing: {
                tight: 'var(--tracking-tight)',
                normal: 'var(--tracking-normal)',
                loose: 'var(--tracking-loose)',
                looser: 'var(--tracking-looser)',
            },

            lineHeight: {
                compact: 'var(--leading-compact)',
                tight: 'var(--leading-tight)',
                snug: 'var(--leading-snug)',
                normal: 'var(--leading-normal)',
                relaxed: 'var(--leading-relaxed)',
                loose: 'var(--leading-loose)',
            },

            /* ==========================================
               COLORS
               ========================================== */
            colors: {
                // Surfaces
                surface: {
                    primary: 'rgb(var(--surface-primary) / <alpha-value>)',
                    secondary: 'rgb(var(--surface-secondary) / <alpha-value>)',
                    tertiary: 'rgb(var(--surface-tertiary) / <alpha-value>)',
                    overlay: 'rgb(var(--surface-overlay) / <alpha-value>)',
                    elevated: 'rgb(var(--surface-elevated) / <alpha-value>)',
                },

                // Backgrounds
                bg: {
                    primary: 'rgb(var(--bg-primary) / <alpha-value>)',
                    secondary: 'rgb(var(--bg-secondary) / <alpha-value>)',
                    tertiary: 'rgb(var(--bg-tertiary) / <alpha-value>)',
                },

                // Text
                text: {
                    primary: 'rgb(var(--text-primary) / <alpha-value>)',
                    secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
                    tertiary: 'rgb(var(--text-tertiary) / <alpha-value>)',
                    quaternary: 'rgb(var(--text-quaternary) / <alpha-value>)',
                    placeholder: 'rgb(var(--text-placeholder) / <alpha-value>)',
                },

                // Borders
                border: {
                    primary: 'rgb(var(--border-primary) / <alpha-value>)',
                    secondary: 'rgb(var(--border-secondary) / <alpha-value>)',
                    tertiary: 'rgb(var(--border-tertiary) / <alpha-value>)',
                    quaternary: 'rgb(var(--border-quaternary) / <alpha-value>)',
                    separator: 'rgb(var(--border-separator) / <alpha-value>)',
                },

                // System Colors
                system: {
                    blue: 'rgb(var(--system-blue) / <alpha-value>)',
                    green: 'rgb(var(--system-green) / <alpha-value>)',
                    indigo: 'rgb(var(--system-indigo) / <alpha-value>)',
                    orange: 'rgb(var(--system-orange) / <alpha-value>)',
                    pink: 'rgb(var(--system-pink) / <alpha-value>)',
                    purple: 'rgb(var(--system-purple) / <alpha-value>)',
                    red: 'rgb(var(--system-red) / <alpha-value>)',
                    teal: 'rgb(var(--system-teal) / <alpha-value>)',
                    yellow: 'rgb(var(--system-yellow) / <alpha-value>)',
                    gray: 'rgb(var(--system-gray) / <alpha-value>)',
                },

                // Semantic
                accent: 'rgb(var(--color-accent) / <alpha-value>)',
                success: 'rgb(var(--color-success) / <alpha-value>)',
                warning: 'rgb(var(--color-warning) / <alpha-value>)',
                error: 'rgb(var(--color-error) / <alpha-value>)',
                info: 'rgb(var(--color-info) / <alpha-value>)',
            },

            /* ==========================================
               SPACING
               ========================================== */
            spacing: {
                '0': 'var(--spacing-0)',
                '1': 'var(--spacing-1)',
                '2': 'var(--spacing-2)',
                '3': 'var(--spacing-3)',
                '4': 'var(--spacing-4)',
                '5': 'var(--spacing-5)',
                '6': 'var(--spacing-6)',
                '8': 'var(--spacing-8)',
                '10': 'var(--spacing-10)',
                '12': 'var(--spacing-12)',
                '16': 'var(--spacing-16)',
            },

            /* ==========================================
               BORDER RADIUS
               ========================================== */
            borderRadius: {
                'sm': 'var(--radius-sm)',
                'DEFAULT': 'var(--radius-md)',
                'md': 'var(--radius-md)',
                'lg': 'var(--radius-lg)',
                'xl': 'var(--radius-xl)',
                '2xl': 'var(--radius-2xl)',
                'full': 'var(--radius-full)',
            },

            /* ==========================================
               SHADOWS
               ========================================== */
            boxShadow: {
                'sm': 'var(--shadow-sm)',
                'DEFAULT': 'var(--shadow-md)',
                'md': 'var(--shadow-md)',
                'lg': 'var(--shadow-lg)',
                'xl': 'var(--shadow-xl)',
            },

            /* ==========================================
               TRANSITIONS
               ========================================== */
            transitionDuration: {
                'fast': '150ms',
                'DEFAULT': '250ms',
                'slow': '350ms',
            },

            transitionTimingFunction: {
                'DEFAULT': 'cubic-bezier(0.4, 0, 0.2, 1)',
            },

            /* ==========================================
               Z-INDEX
               ========================================== */
            zIndex: {
                'base': '0',
                'dropdown': '1000',
                'sticky': '1100',
                'fixed': '1200',
                'modal-backdrop': '1300',
                'modal': '1400',
                'popover': '1500',
                'tooltip': '1600',
            },
        },
    },
    plugins: [],
};

export default config;
