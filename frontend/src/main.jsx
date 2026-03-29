import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Import kedua otak (Context) aplikasi kita
import { AuthProvider } from './context/AuthContext'
import { Web3Provider } from './context/Web3Context' // 👈 Ini yang baru kita buat

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <Web3Provider> {/* 👈 Bungkus App dengan Web3Provider di sini */}
        <App />
      </Web3Provider>
    </AuthProvider>
  </StrictMode>,
)