import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.log('🚀 React main.jsx is executing!')
console.log('🔍 Looking for root element:', document.getElementById('root'))

const rootElement = document.getElementById('root')
if (rootElement) {
  console.log('✅ Root element found, creating React root...')
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  console.log('✅ React render called!')
} else {
  console.error('❌ Root element not found! Make sure <div id="root"></div> exists.')
}
