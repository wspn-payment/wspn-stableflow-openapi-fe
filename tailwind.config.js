/** @type {import('tailwindcss').Config} */
module.exports = {
    mode: 'jit',
    content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
    plugins: [],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                'emerald-400': '#26D3A6',
                'black-400': '#0A090F',
                'hover-black-400': '#0a090f8f',
                'black-200': '#353539',
                'gray-300': '#CAC9CE',
                'gray-600': '#5C5B60',
                'gray-800': '#2C2B2F',
                'gray-900': '#0A090F',
                'secondary-300': '#26D3A5',
                'secondary-400': '#00C891',
                'secondary-500': '#00BD7D',

                divider: '#676767',
                overlay: '#000000d6',

                'second-300': '#26D3A5',
                'orange-600': '#FFB500',
                'red-border': '#F69999',
                btn: 'linear-gradient(105.31deg, #4E5BFF 0%, #26D3A6 100%)',
                modal: 'radial-gradient(100% 100% at 0% 0%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 100%)',
            },
            backgroundImage: {
                'menu-symbol': 'radial-gradient(107.32% 141.42% at 0% 0%, rgba(255, 255, 255, 0.40) 0%, rgba(255, 255, 255, 0.00) 100%)',
                'box-stake': 'radial-gradient(162.36% 150.81% at 0% 0%, rgba(255, 255, 255, 0.40) 0%, rgba(255, 255, 255, 0.00) 100%)',
                'radial-header': 'radial-gradient(100%_100%_at_0%_0%,_rgba(255,_255,_255,_0.4)_0%,_rgba(255,_255,_255,_0)_100%)',
                linear: 'linear-gradient(180deg, #4E5BFF 0%, #26D3A6 100%)',
                card: 'radial-gradient(100% 174.83% at 0% -2.08%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 100%)',
                'card-pc': "url('/images/bg-card.webp')",
                'card-mb': "url('/images/bg-card_mb.webp')",
                btn: 'linear-gradient(105.31deg, #4E5BFF 0%, #26D3A6 100%)',
                'btn-disabled': 'linear-gradient(105.31deg, #0000BD 0%, #00693D 100%)',
                // border: 'linear-gradient(169.15deg, rgba(255, 255, 255, 0.4) 0%, rgba(238, 237, 237, 0.2) 96.79%)',
                'homepage-wrapper': 'linear-gradient(97.63deg, #4E5BFF 16.17%, #26D3A6 97.64%)',
                modal: 'radial-gradient(100% 100% at 0% 0%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 100%)',
                amount: 'linear-gradient(98.76deg, #4E5BFF -58.39%, #26D3A6 97.43%)',
                explorer: ' linear-gradient(94.81deg, #4E5BFF 1.85%, #26D3A6 101.08%)',
                'gradient-table': 'radial-gradient(100% 100% at 0% 0%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 100%)',
            },
            gridTemplateColumns: {
                'auto-5': 'repeat(5, minmax(0, 25%))',
                'auto-2': 'repeat(2, minmax(0, 50%))',
            },
            gridTemplateRows: {
                'auto-0fr': '0fr',
                'auto-1fr': '1fr',
            },
        },
        screens: {
            iphone: {
                max: '430px',
            },
            mobile: {
                max: '640px',
            },
            min_mobile: '641px',
            max_tablet: {
                max: '768px',
            },
            min_tablet: '769px',
            tablet: '768px',
            max_laptop: {
                max: '900px',
            },
            max_table: {
                max: '900px',
            },
            min_table: '901px',
            min_laptop: '900px',
            laptop: '1025px',
            xs_desktop: '1100px',
            s_desktop: '1200px',
            desktop: '1440px',
            extra: '1900px',
        },
    },
    corePlugins: {
        preflight: false,
    },
    important: true,
};
