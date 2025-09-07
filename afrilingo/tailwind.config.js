/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Nigerian flag colors
        'nigeria-green': '#008751',
        'nigeria-white': '#FFFFFF',
        
        // Cultural accent colors
        'royal-gold': '#FFD700',
        'kola-brown': '#8B4513',
        'palm-green': '#228B22',
        'ankara-purple': '#663399',
        'lagoon-blue': '#4682B4',
        
        // Semantic colors
        'cowrie-shell': '#F5DEB3',
        'earth-red': '#CD5C5C',
        'sunset-orange': '#FF6347',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Outfit', 'system-ui', 'sans-serif'],
        // Font that supports Nigerian language diacriticals
        'nigerian': ['Gentium Plus', 'serif'],
      },
      backgroundImage: {
        // Subtle Ankara-inspired patterns
        'ankara-pattern': "url('/src/assets/patterns/ankara-subtle.svg')",
        'kente-pattern': "url('/src/assets/patterns/kente-subtle.svg')",
      },
      animation: {
        'cowrie-bounce': 'cowrie-bounce 1s ease-in-out infinite',
        'drum-beat': 'drum-beat 0.6s ease-in-out infinite',
      },
      keyframes: {
        'cowrie-bounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'drum-beat': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}