import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
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
    screens: {
      'xs': '360px',
      'sm': '430px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1440px',
    },
    extend: {
      spacing: {
        'space-1': 'var(--space-1)',
        'space-2': 'var(--space-2)',
        'space-3': 'var(--space-3)',
        'space-4': 'var(--space-4)',
        'space-5': 'var(--space-5)',
        'space-6': 'var(--space-6)',
        'space-7': 'var(--space-7)',
        'space-8': 'var(--space-8)',
      },
      colors: {
        /* Core system colors */
        border: "hsl(var(--border))",
        "border-hover": "hsl(var(--border-hover))",
        input: "hsl(var(--input))",
        "input-border": "hsl(var(--input-border))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: {
          DEFAULT: "hsl(var(--foreground))",
          muted: "hsl(var(--foreground-muted))",
          subtle: "hsl(var(--foreground-subtle))",
        },

        /* Surface layers - petrolio progressivo */
        surface: "hsl(var(--surface))",
        "surface-2": "hsl(var(--surface-2))",

        /* Primary - Verde Fluo */
        primary: {
          DEFAULT: "hsl(var(--primary))",
          hover: "hsl(var(--primary-hover))",
          foreground: "hsl(var(--primary-foreground))",
        },

        /* Secondary */
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },

        /* Semantic colors */
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",

        /* Muted */
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },

        /* Accent */
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },

        /* Popover */
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },

        /* Card */
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
          hover: "hsl(var(--card-hover))",
        },
      },
      borderRadius: {
        xl: "var(--radius-lg)",    // 24px - card grandi
        lg: "var(--radius)",        // 18px - standard
        md: "var(--radius-sm)",     // 12px - piccoli
        sm: "calc(var(--radius-sm) - 4px)", // 8px
      },
      boxShadow: {
        /* Soft shadows per dark theme */
        "soft": "0 2px 8px -2px rgba(0, 0, 0, 0.2)",
        "soft-lg": "0 8px 16px -4px rgba(0, 0, 0, 0.3)",
        "soft-xl": "0 12px 24px -8px rgba(0, 0, 0, 0.4)",
        "glow-primary": "0 0 20px -4px hsl(var(--primary) / 0.3)",
      },
      transitionDuration: {
        /* Premium timing per micro-interazioni */
        "180": "180ms",
        "240": "240ms",
      },
      transitionTimingFunction: {
        /* Easing morbidi */
        "smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
        "smooth-in": "cubic-bezier(0.4, 0, 1, 1)",
        "smooth-out": "cubic-bezier(0, 0, 0.2, 1)",
      },
      keyframes: {
        /* Animazioni esistenti */
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },

        /* Nuove animazioni premium */
        "slide-up": {
          "0%": {
            transform: "translateY(12px)",
            opacity: "0"
          },
          "100%": {
            transform: "translateY(0)",
            opacity: "1"
          },
        },
        "slide-up-fade": {
          "0%": {
            transform: "translateY(8px)",
            opacity: "0"
          },
          "100%": {
            transform: "translateY(0)",
            opacity: "1"
          },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": {
            transform: "scale(0.95)",
            opacity: "0"
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1"
          },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        "pulse-glow": {
          "0%, 100%": {
            boxShadow: "0 0 20px -4px hsl(var(--primary) / 0.2)"
          },
          "50%": {
            boxShadow: "0 0 20px -4px hsl(var(--primary) / 0.4)"
          },
        },
        "slide-in-left": {
          "0%": {
            transform: "translateX(-100%)",
            opacity: "0"
          },
          "100%": {
            transform: "translateX(0)",
            opacity: "1"
          },
        },
        "slide-in-right": {
          "0%": {
            transform: "translateX(100%)",
            opacity: "0"
          },
          "100%": {
            transform: "translateX(0)",
            opacity: "1"
          },
        },
      },
      animation: {
        /* Animazioni esistenti */
        "accordion-down": "accordion-down 200ms ease-out",
        "accordion-up": "accordion-up 200ms ease-out",

        /* Nuove animazioni premium */
        "slide-up": "slide-up 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-up-fade": "slide-up-fade 240ms cubic-bezier(0.4, 0, 0.2, 1)",
        "fade-in": "fade-in 200ms ease-out",
        "scale-in": "scale-in 200ms cubic-bezier(0.4, 0, 0.2, 1)",
        "shimmer": "shimmer 2s linear infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "slide-in-left": "slide-in-left 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-in-right": "slide-in-right 300ms cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
