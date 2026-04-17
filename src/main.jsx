import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { BagProvider } from './context/BagContext'
import { WishlistProvider } from './context/WishlistContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <WishlistProvider>
        <BagProvider>
          <App />
        </BagProvider>
      </WishlistProvider>
    </BrowserRouter>
  </StrictMode>,
)
