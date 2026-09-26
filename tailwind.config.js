import daisyui from 'daisyui';

/**
 * Design tokens.
 * Dark editorial palette: near-black surfaces, hairline borders, white as the primary "accent".
 * Color is reserved for meaning (success / warning / error), not decoration.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        page: '#050505', // app background
        'surface-3': '#151515', // raised / pressed surfaces
        'line-2': '#303030', // stronger hairline (hover, focus-adjacent)
        muted: '#A0A0A0', // secondary text
        faint: '#666666', // tertiary text: decorative labels and placeholders only
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 0 0 rgb(255 255 255 / 0.04) inset, 0 16px 32px -24px rgb(0 0 0 / 0.9)',
        pop: '0 0 0 1px rgb(255 255 255 / 0.04) inset, 0 24px 48px -16px rgb(0 0 0 / 0.85), 0 8px 16px -8px rgb(0 0 0 / 0.6)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.22, 0.7, 0.2, 1)',
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    logs: false,
    darkTheme: 'careeros',
    themes: [
      {
        careeros: {
          'color-scheme': 'dark',
          primary: '#FFFFFF',
          'primary-content': '#050505',
          secondary: '#A0A0A0',
          'secondary-content': '#050505',
          accent: '#D4D4D4',
          'accent-content': '#050505',
          neutral: '#151515',
          'neutral-content': '#FFFFFF',
          'base-100': '#0A0A0A',
          'base-200': '#101010',
          'base-300': '#242424',
          'base-content': '#FFFFFF',
          info: '#7DB4F0',
          'info-content': '#050505',
          success: '#4CCB8C',
          'success-content': '#050505',
          warning: '#F0B849',
          'warning-content': '#050505',
          error: '#F26D6D',
          'error-content': '#050505',

          '--rounded-box': '1.25rem',
          '--rounded-btn': '0.75rem',
          '--rounded-badge': '9999px',
          '--animation-btn': '0.2s',
          '--animation-input': '0.2s',
          '--btn-focus-scale': '0.97',
          '--border-btn': '1px',
          '--tab-border': '1px',
          '--tab-radius': '0.75rem',
        },
      },
    ],
  },
};
