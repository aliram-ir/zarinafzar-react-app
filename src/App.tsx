import { BrowserRouter } from 'react-router-dom'
import AppRoutes from '@/routes/AppRoutes'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// 🆕 ایمپورت Provider دینامیک MUI 
import { ThemeModeProvider } from '@/providers/ThemeModeProvider' // مطمئن شوید مسیر Alias درست است

export default function App() {
  return (
    // 1️⃣ جایگزینی تم ایستا با Provider دینامیک
    <ThemeModeProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      {/* 2️⃣ ToastContainer باید داخل ThemeProvider باشد تا تم را بگیرد */}
      <ToastContainer rtl position="bottom-left" />
    </ThemeModeProvider>
  )
}
