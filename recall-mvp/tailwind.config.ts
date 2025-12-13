
import type { Config } from "tailwindcss"

const config = {
  darkMode: "class",
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
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
        // Primary Theme (from Landing Page & Onboarding)
        "primary": "#E07A5F",
        "primary-dark": "#C66348",
        "secondary": "#F2CC8F",
        "background": "#FDFCF8",
        "surface": "#FFFFFF",
        "text-main": "#3D3430",
        "text-muted": "#756A63",

        // Warm Theme (from Onboarding/Chapter Detail)
        "warm-primary": "#E08E6D",
        "warm-secondary": "#F3D8C6",
        "warm-bg-light": "#FDFBF7",
        "warm-bg-dark": "#2A2320",
        "text-sub": "#8C7B70",

        // Accent/Status Colors
        "accent": "#f4a261",

        // Glassmorphism
        "glass-border": "rgba(255, 255, 255, 0.4)",
        "glass-bg": "rgba(255, 255, 255, 0.6)",
        "dark-glass-bg": "rgba(42, 35, 32, 0.6)",

        // ShadCN UI Colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        foreground: "hsl(var(--foreground))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Spline Sans", "sans-serif"],
        serif: ["Lora", "serif", "Noto Serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "calc(var(--radius) + 4px)",
        "3xl": "calc(var(--radius) + 12px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
