
import React from 'react'
import { ThemeProvider } from './components/ui/theme-provider'
import UpdatedCode from './UpdatedCode'

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="container mx-auto p-4">
        <UpdatedCode />
      </div>
    </ThemeProvider>
  )
}

export default App
