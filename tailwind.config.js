
/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
	theme: {
	  extend: {
		fontFamily: {
			'system-default': [
			  'system-ui',
			  '-apple-system',
			  'Segoe UI',
			  'Roboto',
			  'Ubuntu',
			  'Cantarell',
			  'Noto Sans',
			  'sans-serif',
			  'BlinkMacSystemFont',
			  'Helvetica Neue',
			  'Arial',
			  'Liberation Sans',
			  'Apple Color Emoji',
			  'Segoe UI Emoji',
			  'Segoe UI Symbol',
			  'Noto Color Emoji'
			],
		  },
		borderRadius: {
		  lg: 'var(--radius)',
		  md: 'calc(var(--radius) - 2px)',
		  sm: 'calc(var(--radius) - 4px)'
		},
		colors: {
		  background: 'hsl(var(--background))',
		  foreground: 'hsl(var(--foreground))',
		  card: {
			DEFAULT: 'hsl(var(--card))',
			foreground: 'hsl(var(--card-foreground))'
		  },
		  popover: {
			DEFAULT: 'hsl(var(--popover))',
			foreground: 'hsl(var(--popover-foreground))'
		  },
		  primary: {
			DEFAULT: 'hsl(var(--primary))',
			foreground: 'hsl(var(--primary-foreground))'
		  },
		  secondary: {
			DEFAULT: 'hsl(var(--secondary))',
			foreground: 'hsl(var(--secondary-foreground))'
		  },
		  muted: {
			DEFAULT: 'hsl(var(--muted))',
			foreground: 'hsl(var(--muted-foreground))'
		  },
		  accent: {
			DEFAULT: 'hsl(var(--accent))',
			foreground: 'hsl(var(--accent-foreground))'
		  },
		  destructive: {
			DEFAULT: 'hsl(var(--destructive))',
			foreground: 'hsl(var(--destructive-foreground))'
		  },
		  border: 'hsl(var(--border))',
		  input: 'hsl(var(--input))',
		  ring: 'hsl(var(--ring))',
		  chart: {
			'1': 'hsl(var(--chart-1))',
			'2': 'hsl(var(--chart-2))',
			'3': 'hsl(var(--chart-3))',
			'4': 'hsl(var(--chart-4))',
			'5': 'hsl(var(--chart-5))'
		  }
		},
		backgroundImage: {
		  'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
		  'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
		},
		animation: {
		  'fade-in': 'fadeIn 0.4s ease-out forwards',
		  'scale-in': 'scaleIn 0.4s ease-out forwards',
		  'slide-in': 'slideIn 0.4s ease-out forwards',
		},
		keyframes: {
		  fadeIn: {
			from: { opacity: 0 },
			to: { opacity: 1 },
		  },
		  scaleIn: {
			from: { transform: 'scale(0.95)', opacity: 0 },
			to: { transform: 'scale(1)', opacity: 1 },
		  },
		  slideIn: {
			from: { transform: 'translateY(-10px)', opacity: 0 },
			to: { transform: 'translateY(0)', opacity: 1 },
		  },
		},
	  }
	},
	plugins: [require("tailwindcss-animate")],
  }
  