import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

const preloader = document.getElementById('app-preloader')
if (preloader) {
  requestAnimationFrame(() => {
    setTimeout(() => {
      preloader.classList.add('preloader-hidden')
      preloader.addEventListener('transitionend', () => preloader.remove(), { once: true })
    }, 350)
  })
}
