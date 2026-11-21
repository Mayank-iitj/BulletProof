/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0B0D12',
        surface: '#141821',
        'surface-2': '#1C2230',
        text: '#EDEFF5',
        muted: '#8A93A6',
        border: '#262D3D',
        accent: '#7CFFB2',
        'accent-dark': '#0A8F4F',
        'team-concise': '#6EA8FF',
        'team-impact': '#FFB84D',
        'team-story': '#C792FF',
        danger: '#FF6B6B',
      },
      fontFamily: {
        serif: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.6 },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
        'pulse-subtle': 'pulseSubtle 2s infinite ease-in-out',
      },
    },
  },
  plugins: [],
}
