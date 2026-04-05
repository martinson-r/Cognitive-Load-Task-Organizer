import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import './styles/themes.css'
import App from './App'
import UIGuide from './components/UIGuide'
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from './context/ThemeContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <HashRouter>
        <Routes>
          {/* Main App Route - accessible at your-site.com/#/ */}
          <Route path="/" element={
            <ErrorBoundary>
              <App />
            </ErrorBoundary>} />

          {/* Hidden UI Guide Route - accessible at your-site.com/#/ui-guide */}
          <Route path="/ui-guide" element={<UIGuide />} />
        </Routes>
      </HashRouter>
    </ThemeProvider>
  </StrictMode>,
)