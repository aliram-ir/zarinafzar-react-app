// 📁 src/App.tsx
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeModeProvider } from '@/providers/ThemeModeProvider'
import ToastProvider from '@/components/ToastProvider'
import AppRoutes from '@/routes/AppRoutes'

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeModeProvider>
        <ToastProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ToastProvider>
      </ThemeModeProvider>
    </BrowserRouter>
  )
}

export default App
