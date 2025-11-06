// import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './assets/styles/style.css'
import 'vazirmatn/vazirmatn-font-face.css'

// ⚠️ StrictMode حذف شده تا باعث دوباره اجرا شدن useEffect و Toast نشود
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <App />
)
