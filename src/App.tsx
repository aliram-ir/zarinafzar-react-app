// 📁 src/App.tsx
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from '@/routes/AppRoutes'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { ThemeModeProvider } from '@/providers/ThemeModeProvider'
import { AuthProvider } from '@/contexts/AuthContext'

export default function App() {
  return (
    <ThemeModeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>

        <ToastContainer
          position="bottom-left"
          rtl
          newestOnTop
          autoClose={4000}
          pauseOnHover
          draggable
          theme="colored"
        />
      </AuthProvider>
    </ThemeModeProvider>
  )
}
