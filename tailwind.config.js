/** Production Tailwind build — replaces the former CDN runtime config */
module.exports = {
  content: ['./*.html', './blog/*.html', './frontend/*.html', './assets/js/*.js'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brandBg: '#0B0F19',
        brandSurface: '#1E293B',
        brandBgDark: '#0B0F19',
        brandSurfaceDark: '#1E293B',
        brandBgLight: '#F8FAFC',
        brandSurfaceLight: '#FFFFFF',
        brandNeon: '#38BDF8',
        brandBlue: '#2563EB',
        brandCyan: '#06B6D4',
        borderDark: '#334155',
      },
    },
  },
}
