import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F3EFE6',
        paper2: '#ECE6D8',
        ink: '#232A22',
        inkmuted: '#5B6058',
        rule: '#C9C2B2',
        sage: { DEFAULT: '#4F6E5C', dark: '#3C5547', light: '#7C9787' },
        amber: { DEFAULT: '#C98A3A', dark: '#A86F28', light: '#E3B270' },
        brick: { DEFAULT: '#9C4A3C', light: '#C97B6C' },
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'serif'],
        body: ['var(--font-source-sans)', 'sans-serif'],
        mono: ['var(--font-plex-mono)', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(35,42,34,0.06), 0 4px 14px rgba(35,42,34,0.06)',
      },
      borderRadius: {
        card: '0.6rem',
      },
    },
  },
  plugins: [],
};
export default config;
