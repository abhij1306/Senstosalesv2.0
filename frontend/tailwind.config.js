/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                app: {
                    bg: "var(--bg-base)",
                    surface: "var(--bg-surface)",
                    overlay: "var(--bg-overlay)",
                    border: "var(--border-subtle)",
                    fg: "var(--app-fg)",
                    accent: "var(--accent)",
                }
            },
            boxShadow: {
                'clay': 'var(--shadow-clay-surface)',
                'lifted': 'var(--shadow-lifted)',
                'pill': 'var(--shadow-pill)',
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
            },
            backdropBlur: {
                'sm': '4px',
                'md': '12px',
                'lg': '24px',
            },
        },
    },
    plugins: [],
}
