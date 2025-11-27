import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './styles/globals.css'

// Initialize Supabase config from environment
window.SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
window.SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Polyfill crypto.randomUUID for environments/extensions that override Crypto
if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID !== 'function') {
  const cryptoRef = globalThis.crypto as Crypto & { randomUUID?: () => string }
  cryptoRef.randomUUID = () =>
    '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) =>
      (Number(c) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))).toString(16)
    )
}

console.log('[Main] Initializing app...')
console.log('[Main] Supabase URL:', window.SUPABASE_URL)
console.log('[Main] Vite env vars:', import.meta.env)

const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element not found')
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
