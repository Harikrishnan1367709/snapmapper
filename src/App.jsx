
import React from 'react'
import { ThemeProvider } from './components/ui/theme-provider'
import Index from './pages/Index'

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="container mx-auto p-4">
        <Index />
      </div>
    </ThemeProvider>
  )
}

export default App
