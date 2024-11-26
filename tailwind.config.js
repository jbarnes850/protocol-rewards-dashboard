/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'near-purple': '#9797ff',
        'near-green': '#00ec97',
        'near-blue': '#4899F8',
        'near-red': '#FF585D',
        'near-black': '#000000',
      },
      keyframes: {
        'collapse-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-collapsible-content-height)' },
        },
        'collapse-up': {
          from: { height: 'var(--radix-collapsible-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'collapse-down': 'collapse-down 0.2s ease-out',
        'collapse-up': 'collapse-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
  safelist: [
    'hover:border-opacity-40',
    'hover:border-[#9797ff]',
    {
      pattern: /bg-(near-purple|near-green|near-blue|near-red)/,
      variants: ['hover'],
    },
  ],
}