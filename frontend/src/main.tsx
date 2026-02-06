import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initMiniApp } from './lib/miniapp'

// Initialize mini-app mode
initMiniApp()

// Suppress DialogTitle warning from WorldID library (library issue, not our code)
// This warning comes from Radix UI Dialog used internally by @worldcoin/idkit
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  const message = args[0]?.toString() || '';
  // Suppress DialogContent/DialogTitle warnings from WorldID library
  if (
    message.includes('DialogContent') && 
    (message.includes('DialogTitle') || message.includes('requires a'))
  ) {
    return; // Suppress this warning - it's from the WorldID library, not our code
  }
  originalWarn.apply(console, args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
