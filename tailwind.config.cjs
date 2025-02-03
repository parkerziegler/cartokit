/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontSize: {
        '2xs': ['0.6875rem', '1rem'],
        '3xs': ['0.625rem', '1rem']
      },
      colors: {
        ck: '#7e58ff',
        'ck-light': 'rgba(126, 88, 255, 0.8)'
      }
    }
  },
  plugins: []
};
