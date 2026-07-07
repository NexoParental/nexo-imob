import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper:    'var(--paper)',
        surface:  'var(--surface)',
        'surface-alt': 'var(--surface-alt)',
        ink:      'var(--ink)',
        'ink-soft':  'var(--ink-soft)',
        'ink-faint': 'var(--ink-faint)',
        accent:   'var(--accent)',
        'accent-deep': 'var(--accent-deep)',
        'accent-soft': 'var(--accent-soft)',
        line:     'var(--line)',
        success:  'var(--success)',
        'success-bg': 'var(--success-bg)',
        urgent:   'var(--urgent)',
        'urgent-bg': 'var(--urgent-bg)',
        warning:  'var(--warning)',
        'warning-bg': 'var(--warning-bg)',
      },
      borderRadius: { DEFAULT: 'var(--radius)', sm: '2px', md: '4px', lg: '8px' },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'], mono: ['IBM Plex Mono', 'monospace'] },
    },
  },
  plugins: [],
}
export default config
