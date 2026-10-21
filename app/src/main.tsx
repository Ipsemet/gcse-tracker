import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from '@/App'
import '@/styles/global.css'

// HashRouter, not BrowserRouter: GitHub Pages serves static files with no
// rewrite rule, so a deep link like /subject/cs would 404 on refresh.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
