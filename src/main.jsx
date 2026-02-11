import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from "@vercel/speed-insights/next"
import ScrollReveal from './components/ScrollReveal.jsx'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import MishubishiGate from './pages/MishubishiGate.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ScrollReveal>
              <App />
            </ScrollReveal>
          }
        />
        <Route path="/mishubishi" element={<MishubishiGate />} />
      </Routes>
    </BrowserRouter>
    <Analytics />
    <SpeedInsights />
  </StrictMode>,
)
