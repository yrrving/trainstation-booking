import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log('🚀 main.tsx is loading...')

const root = document.getElementById('root')
if (!root) {
  document.body.innerHTML = '<div style="padding: 20px; color: red;">Error: Root element not found!</div>'
  throw new Error('Root element not found')
}

console.log('✅ Creating React root...')
try {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  console.log('✅ React app rendered!')
} catch (error) {
  console.error('❌ Error rendering app:', error)
  document.body.innerHTML = '<div style="padding: 20px; color: red;">Error: ' + error + '</div>'
}
