/** @type {import('tailwindcss').Config} */
// tailwind.config.js
module.exports = {
  content: ["./public/index.html","./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        'marquee-ltr': {
          '0%':   { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
      },
      animation: {
        'marquee-ltr': 'marquee-ltr 40s linear infinite',
      },
    },
  },
  plugins: [],
};
