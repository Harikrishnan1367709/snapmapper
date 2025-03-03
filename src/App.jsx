
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import UpdatedCode from './components/UpdatedCode'
import Documentation from './components/Documentation'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UpdatedCode />} />
        <Route path="/docs" element={<Documentation />} />
      </Routes>
    </Router>
  )
}

export default App
