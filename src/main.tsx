import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './styles/globals.css'

// Initialize Supabase config from environment
window.SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
window.SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

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
