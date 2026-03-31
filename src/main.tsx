import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Use HashRouter to avoid server-side 404s on refresh
import { HashRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import UIGuide from './components/UIGuide.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        {/* Main App Route - accessible at your-site.com/#/ */}
        <Route path="/" element={<App />} />
        
        {/* Hidden UI Guide Route - accessible at your-site.com/#/ui-guide */}
        <Route path="/ui-guide" element={<UIGuide />} />
      </Routes>
    </HashRouter>
  </StrictMode>,
)
