import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Automatically swap based on the active DaisyUI theme!
        page: 'var(--page)', 
        'surface-3': 'var(--surface-3)', 
        'line-2': 'var(--line-2)', 
        muted: 'var(--muted)', 
        faint: 'var(--faint)', 
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
        // --- YOUR EXISTING DARK THEME ---
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

          // Custom CSS Variables for Dark Mode
          '--page': '#050505',
          '--surface-3': '#151515',
          '--line-2': '#303030',
          '--muted': '#A0A0A0',
          '--faint': '#666666',

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
        
        // --- NEW LIGHT THEME ---
        'careeros-light': {
          'color-scheme': 'light',
          primary: '#050505', // Black buttons in light mode
          'primary-content': '#FFFFFF',
          secondary: '#52525B',
          'secondary-content': '#FFFFFF',
          accent: '#3F3F46',
          'accent-content': '#FFFFFF',
          neutral: '#E4E4E7',
          'neutral-content': '#050505',
          'base-100': '#FFFFFF',
          'base-200': '#F4F4F5',
          'base-300': '#E4E4E7',
          'base-content': '#050505',
          info: '#0284C7',
          'info-content': '#FFFFFF',
          success: '#16A34A',
          'success-content': '#FFFFFF',
          warning: '#D97706',
          'warning-content': '#FFFFFF',
          error: '#DC2626',
          'error-content': '#FFFFFF',

          // Custom CSS Variables for Light Mode
          '--page': '#F8FAFC', // Soft off-white app background
          '--surface-3': '#F1F5F9', // Elevated surface
          '--line-2': '#E2E8F0', // Border colors
          '--muted': '#64748B', // Secondary text
          '--faint': '#94A3B8', // Tertiary text

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