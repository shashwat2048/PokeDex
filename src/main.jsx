import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerServiceWorker } from './utils/registerSW'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register Service Worker for PWA and offline support
if (import.meta.env.PROD) {
  registerServiceWorker()
    .then(registration => {
      if (registration) {
        console.log('✅ PWA features enabled! App works offline now.');
      }
    })
    .catch(err => console.error('❌ Service Worker registration failed:', err));
}
