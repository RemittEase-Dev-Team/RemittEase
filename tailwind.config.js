import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            colors: {
                'dark-navy': '#0A192F',
                'soft-white': '#F8F9FA',
                'cool-gray': '#D1D5DB',
                'bright-blue': '#007BFF',
                'neon-cyan': '#00F0FF',
                'bright-orange': '#FF6B00',
                'cyber-purple': '#8A2BE2',
            },
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
        },
    },

    plugins: [forms],
};
