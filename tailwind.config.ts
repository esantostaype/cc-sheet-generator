import type { Config } from 'tailwindcss'

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        orbit: {
          '0%':   { transform: 'rotate(0deg) translateX(24px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(24px) rotate(-360deg)' },
        },
      },
      animation: {
        orbit: 'orbit 1s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config