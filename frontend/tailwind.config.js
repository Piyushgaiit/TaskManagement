/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: "#0052CC", // Jira Blue
                "primary-hover": "#0065FF",
                "background-light": "#FFFFFF",
                "background-dark": "#181B1F", // Dark mode almost black
                "surface-light": "#FAFBFC",
                "surface-dark": "#22262A",
                "border-light": "#DFE1E6",
                "border-dark": "#3A3F46",
                "text-light": "#172B4D",
                "text-dark": "#B6C2CF",
                "text-secondary-light": "#5E6C84",
                "text-secondary-dark": "#8C9BAB",
                "sidebar-light": "#FAFBFC",
                "sidebar-dark": "#1E2125",
                "selection-blue-light": "#DEEBFF",
                "selection-blue-dark": "#0C294F",
            },
            fontFamily: {
                display: ["Roboto", "sans-serif"],
                body: ["Roboto", "sans-serif"],
            },
            fontSize: {
                'xs': '0.75rem',
                'sm': '0.875rem',
                'base': '1rem',
                'lg': '1.125rem',
                'xl': '1.25rem',
                '2xl': '1.5rem',
            },
            boxShadow: {
                'xs': '0 0 0 1px rgba(9, 30, 66, 0.08)',
            }
        },
    },
    plugins: [],
}
