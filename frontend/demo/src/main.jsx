import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { VaultAuthProvider } from './context/VaultAuthContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <VaultAuthProvider>
      <App />
    </VaultAuthProvider>
  </StrictMode>,
)