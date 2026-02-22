import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import ShareablePage from './components/ShareablePage.tsx'
import AnalyticsPage from './components/AnalyticsPage.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/c/:shortcode" element={<ShareablePage />} />
        <Route path="/analytics/:shortcode" element={<AnalyticsPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
