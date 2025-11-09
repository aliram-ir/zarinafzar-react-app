// 📁 src/routes/ProtectedRoute.tsx
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { CircularProgress, Box } from '@mui/material'

interface ProtectedRouteProps {
    children: React.ReactNode
}

/**
 * کامپوننت محافظت از روت‌های احراز هویت شده
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth()

    // نمایش لودینگ در حال بارگذاری
    if (isLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                }}
            >
                <CircularProgress />
            </Box>
        )
    }

    // اگر احراز نشده، به صفحه لاگین برو
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}

export default ProtectedRoute
