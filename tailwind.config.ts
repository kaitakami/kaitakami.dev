import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        dark: 'var(--color-dark)',
        alternative: 'var(--color-alternative)',
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        error: 'var(--color-error)',
        onPrimary: 'var(--color-on-primary)',
        onSecondary: 'var(--color-on-secondary)',
        onBackground: 'var(--color-on-background)',
        onSurface: 'var(--color-on-surface)',
        onError: 'var(--color-on-error)',
        "background-start": 'var(--background-start)',
        "background-end": 'var(--background-end)',
      },
      animation: {
        'gradient-x': 'gradient-x 3s ease-in-out infinite',
        'pulse-subtle': 'pulse 4s ease-in-out infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 100%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 100%',
            'background-position': 'right center',
          },
        },
        'pulse': {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '0.7',
          },
        },
      },
    },
  },
  plugins: [],
}
export default config
