export default { content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"], theme: { extend: {} }, plugins: [] } 
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 📌 Spacing System
      spacing: {
        'section': '40px',
        'container': '20px',
        'card': '20px',
        'grid-gap': '14px',
      },
      
      // 📌 Typography
      fontSize: {
        'heading': '22px',
        'card': '14px',
      },
      
      // 📌 Font Weight
      fontWeight: {
        'semibold': '600',
      },
      
      // 📌 Layout
      gridTemplateColumns: {
        'category': 'repeat(auto-fill, minmax(140px, 1fr))',
        'product': 'repeat(auto-fill, minmax(200px, 1fr))',
      },
      
      // 📌 Colors (Your brand colors)
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        secondary: {
          500: '#8b5cf6',
        },
        brand: {
          dark: '#1a1a2e',
          light: '#f8f9fa',
        }
      },
      
      // 📌 Border Radius
      borderRadius: {
        'card': '8px',
        'xl': '12px',
      },
      
      // 📌 Box Shadow
      boxShadow: {
        'card': '0 4px 12px rgba(0,0,0,0.1)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.15)',
      },
      
      // 📌 Transitions
      transitionDuration: {
        '200': '200ms',
      },
    },
  },
  plugins: [],
}