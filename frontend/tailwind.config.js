/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        serif: ['DM Serif Display', 'serif'],
        caveat: ['Caveat', 'cursive'],
      },
      colors: {
        background: '#f5f0e8',
        foreground: '#2c2416',
        card: '#fefcf7',
        'card-foreground': '#2c2416',
        primary: {
          DEFAULT: '#2c2416',
          foreground: '#fefcf7',
        },
        secondary: {
          DEFAULT: '#e8e0d0',
          foreground: '#2c2416',
        },
        muted: {
          DEFAULT: '#ede6d8',
          foreground: '#8a7d68',
        },
        accent: {
          DEFAULT: '#e8d5b7',
          foreground: '#2c2416',
        },
        destructive: {
          DEFAULT: '#c0392b',
          foreground: '#fff',
        },
        border: 'rgba(44, 36, 22, 0.12)',
        'input-bg': '#f3f3f5',
        ring: '#ce93d8',
      },
      borderRadius: {
        '2xl': '1rem',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.5s ease-out',
        float: 'float 3s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
