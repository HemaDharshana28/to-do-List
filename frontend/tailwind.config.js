/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        body:    ['DM Sans', 'sans-serif'],
        display: ['Sora', 'DM Sans', 'sans-serif'],
        sans:    ['DM Sans', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Premium gold brand
        brand: {
          50:  '#fffbea',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#f5d020',
          500: '#d4af37',
          600: '#b8860b',
          700: '#9a6f08',
          800: '#7a5600',
          900: '#5c4000',
        },
        // Warm amber accent
        accent: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        surface: {
          0:   '#ffffff',
          50:  '#fdf9f0',
          100: '#f8f1e0',
          200: '#ede4cc',
          300: '#ddd0b0',
        },
        canvas: '#fdf9f2',
        ink: {
          primary:   '#1a1404',
          secondary: '#3d3010',
          tertiary:  '#7a6835',
          disabled:  '#b09f65',
        },
      },
      boxShadow: {
        card:        '0 1px 4px rgba(26,20,4,0.05), 0 4px 20px rgba(26,20,4,0.04)',
        'card-hover':'0 4px 12px rgba(26,20,4,0.08), 0 12px 40px rgba(26,20,4,0.08)',
        modal:       '0 24px 80px rgba(26,20,4,0.25)',
        'glow-gold': '0 0 0 3px rgba(212,175,55,0.22)',
      },
      animation: {
        'fade-in':  'fadeIn  0.25s ease-out',
        'slide-up': 'slideUp 0.3s  ease-out',
        'scale-in': 'scaleIn 0.22s ease-out',
        'float':    'float   6s ease-in-out infinite',
        'breathe':  'breathe 4s ease-in-out infinite',
        'ripple':   'ripple  1s ease-out forwards',
      },
      keyframes: {
        fadeIn:  { '0%':{'opacity':'0'},         '100%':{'opacity':'1'} },
        slideUp: { '0%':{'opacity':'0','transform':'translateY(10px)'}, '100%':{'opacity':'1','transform':'translateY(0)'} },
        scaleIn: { '0%':{'opacity':'0','transform':'scale(0.94)'},       '100%':{'opacity':'1','transform':'scale(1)'} },
        float:   { '0%,100%':{'transform':'translateY(0)'},              '50%':{'transform':'translateY(-8px)'} },
        breathe: { '0%,100%':{'transform':'scale(1)','opacity':'0.7'},   '50%':{'transform':'scale(1.35)','opacity':'1'} },
        ripple:  { 'from':{'transform':'scale(1)','opacity':'0.6'},      'to':{'transform':'scale(2.2)','opacity':'0'} },
      },
    },
  },
  plugins: [],
}
