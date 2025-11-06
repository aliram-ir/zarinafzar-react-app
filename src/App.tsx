import { BrowserRouter } from 'react-router-dom'
import AppRoutes from '@/routes/AppRoutes'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { ThemeModeProvider } from '@/providers/ThemeModeProvider'

export default function App() {
  return (
    <ThemeModeProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>

      {/* ✅ فقط همین یک ToastContainer */}
      <ToastContainer
        position="bottom-left"
        rtl
        newestOnTop
        autoClose={4000}
        pauseOnHover
        draggable
        theme="colored"
      />
    </ThemeModeProvider>
  )
}
