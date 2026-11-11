/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F3F0E7',
        forest: {
          50: '#EFF5F1',
          100: '#DCE9E1',
          200: '#B9D2C4',
          300: '#8FB5A2',
          400: '#5E8F78',
          500: '#3D6B55',
          600: '#2C5543',
          700: '#244B3B',
          800: '#1D3D30',
          900: '#163026',
        },
        ink: '#1C2321',
        muted: '#6B7269',
        line: '#E3DECF',
        card: '#FFFFFF',
        amber: { soft: '#FBF6E9' },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(28, 35, 33, 0.05), 0 1px 3px rgba(28, 35, 33, 0.04)',
        pop: '0 4px 16px rgba(28, 35, 33, 0.08)',
      },
      borderRadius: {
        xl2: '0.875rem',
      },
    },
  },
  plugins: [],
}
