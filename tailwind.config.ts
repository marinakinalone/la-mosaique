import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary_light: '#cdcec5',
        primary_dark: '#1f1413',
        brand_1: '#a87152',
        brand_2: '#3a595b',
        brand_3: '#b69d83',
        brand_4: '#a1ae9f',
        brand_5: '#c6c2a5',
        brand_6: '#aaaa93',
        brand_7: '#bc9a56',
        brand_8: '#818169',
        brand_9: '#a4b3be',
      },
      fontFamily: {
        primary: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
}

export default config
