import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import UIGuide from './components/UIGuide.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Main App Route */}
        <Route path="/" element={<App />} />
        
        {/* Hidden UI Guide Route */}
        <Route path="/ui-guide" element={<UIGuide />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)