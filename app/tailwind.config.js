/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],

  theme: {
    extend: {
      colors: {
        // =========================
        // Identité IE237
        // =========================
        primary: "#386641",          // Vert institutionnel
        "primary-hover": "#124116",  // Hover
        "primary-light": "#66BB6A",  // Accent léger
        "primary-soft": "#A5D6A7",   // Fonds légers
        "primary-bg": "#E8F5E9",     // Sections

        secondary: "#BC4749",          // Rouge secondaire
        "secondary-hover": "#8E1414",  // Hover
        "secondary-light": "#EF5350",  // Accent léger
        "secondary-soft": "#EF9A9A",   // Fonds légers
        "secondary-bg": "#FFEBEE",     // Sections

        tertiary: "#F2E8CF",           // Jaune tertiaire
        "tertiary-hover": "#F57F17",   // Hover
        "tertiary-light": "#FFEE58",   // Accent léger
        "tertiary-soft": "#FFF59D",    // Fonds légers
        "tertiary-bg": "#FFFDE7",      // Sections 
        // =========================
        // Couleurs neutres
        // =========================
        background: "#FFFFFF",
        surface: "#FFFFFF",

        heading: "#0A0A0A",
        body: "#4B4B4B",
        muted: "#6B7280",

        border: "#E8E8E8",

        // =========================
        // États
        // =========================
        success: "#16A34A",
        warning: "#D97706",
        danger: "#DC2626",
        info: "#2563EB",

        // =========================
        // Nuances de vert
        // =========================
        green: {
          50: "#F3FAF3",
          100: "#E8F5E9",
          200: "#C8E6C9",
          300: "#A5D6A7",
          400: "#81C784",
          500: "#66BB6A",
          600: "#43A047",
          700: "#2E7D32",
          800: "#1B5E20",
          900: "#145A18",
        },

        // =========================
        // Gris
        // =========================
        gray: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        },
      },

      fontFamily: {
        sans: ["\"Inter Variable\"", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },

      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },

      boxShadow: {
        sm: "0 1px 2px rgba(0,0,0,.05)",
        md: "0 4px 12px rgba(0,0,0,.08)",
        lg: "0 12px 32px rgba(0,0,0,.10)",
      },

      transitionDuration: {
        250: "250ms",
      },
    },
  },

  corePlugins: {
    preflight: false,
  },
};