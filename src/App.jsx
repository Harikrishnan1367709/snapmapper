
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import UpdatedCode from './components/UpdatedCode'
import { Documentation } from './components/Documentation'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UpdatedCode />} />
        <Route path="/docs" element={<Documentation />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
