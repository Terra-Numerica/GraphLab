/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                blue: {
                    DEFAULT: '#24A1EB',
                    hover: '#117DBD',
                    light: '#95D1F5',
                },
                darkBlue: '#1A182D',
                darkCyan: '#40E0D0',
                darkRed: '#B22222',
                yellow: '#F9BB12',
                astro: '#2A233E',
                green: {
                    DEFAULT: '#00A19A',
                    hover: '#008080',
                },
                grey: '#EBEBEC',
                cyan: '#00FFFF',
                red: {
                    DEFAULT: '#DC143C',
                    hover: '#B22222',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
