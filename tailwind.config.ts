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
      },
    },
  },
  plugins: [],
}
export default config
