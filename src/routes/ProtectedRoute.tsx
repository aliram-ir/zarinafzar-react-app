// 📁 src/components/ProtectedRoute.tsx
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { useAuth } from "@/hooks/useAuth"

interface ProtectedRouteProps {
    children: React.ReactNode
}

/**
 * کامپوننت محافظت از روت‌ها
 * اگر کاربر لاگین نکرده بود، به صفحه لاگین هدایت می‌شود
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth()
    const location = useLocation()

    // در حال بارگذاری
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

    // اگر لاگین نکرده، به صفحه لاگین هدایت شود
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    // اگر لاگین کرده، محتوا نمایش داده شود
    return <>{children}</>
}

export default ProtectedRoute
