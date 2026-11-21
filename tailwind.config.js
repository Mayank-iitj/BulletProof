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
        // GitHub Dark Theme exact tokens
        gh: {
          canvas: '#0d1117',
          subtle: '#161b22',
          inset: '#010409',
          border: '#30363d',
          'border-muted': '#21262d',
          text: '#e6edf3',
          muted: '#7d8590',
          blue: '#2f81f7',
          'blue-hover': '#58a6ff',
          green: '#238636',
          'green-hover': '#2ea043',
          'green-badge': '#1f6feb',
          purple: '#8957e5',
          red: '#da3633',
          orange: '#d29922',
        },
        // Variant theme colors mapped to GitHub aesthetics
        'team-concise': '#58a6ff',
        'team-impact': '#f0883e',
        'team-story': '#bc8cff',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          '"Noto Sans"',
          'Helvetica',
          'Arial',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          '"SF Mono"',
          'Menlo',
          'Consolas',
          '"Liberation Mono"',
          'monospace',
        ],
      },
    },
  },
  plugins: [],
}
