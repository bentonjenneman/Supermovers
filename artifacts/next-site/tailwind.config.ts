import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#CA1111',
          blue: '#21356A',
        },
        ink: '#1F1D1D',
        surface: '#2A2626',
        paper: '#F5F1ED',
        'ink-muted': '#A8A29E',
        border: '#3D3838',
        tint: {
          red: '#3A1414',
          blue: '#16233F',
        },
      },
      fontFamily: {
        heading: ['var(--font-poppins)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
