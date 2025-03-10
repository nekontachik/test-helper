/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        success: {
          DEFAULT: "var(--success, #10b981)",
          foreground: "var(--success-foreground, #ffffff)",
        },
        warning: {
          DEFAULT: "var(--warning, #f59e0b)",
          foreground: "var(--warning-foreground, #ffffff)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      boxShadow: {
        focus: "var(--focus-ring, 0 0 0 2px rgba(66, 153, 225, 0.5))",
      },
      spacing: {
        '1': 'var(--spacing-1, 0.25rem)',
        '2': 'var(--spacing-2, 0.5rem)',
        '3': 'var(--spacing-3, 0.75rem)',
        '4': 'var(--spacing-4, 1rem)',
        '5': 'var(--spacing-5, 1.25rem)',
      },
      fontSize: {
        'xs': 'var(--font-size-xs, 0.75rem)',
        'sm': 'var(--font-size-sm, 0.875rem)',
        'base': 'var(--font-size-md, 1rem)',
        'lg': 'var(--font-size-lg, 1.125rem)',
        'xl': 'var(--font-size-xl, 1.25rem)',
        '2xl': 'var(--font-size-2xl, 1.5rem)',
      },
      lineHeight: {
        'tight': 'var(--line-height-tight, 1.25)',
        'normal': 'var(--line-height-normal, 1.5)',
        'loose': 'var(--line-height-loose, 2)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
