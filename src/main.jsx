
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { Router } from './router'
import { ThemeProvider } from './components/ui/theme-provider'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Router />
    </ThemeProvider>
  </React.StrictMode>,
)
