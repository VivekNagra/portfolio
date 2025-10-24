import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from "@vercel/speed-insights/next"
import ScrollReveal from './components/ScrollReveal.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ScrollReveal>
      <App />
    </ScrollReveal>
    <Analytics />
    <SpeedInsights />
  </StrictMode>,
)
