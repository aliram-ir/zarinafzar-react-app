// 📁 src/routes/PublicRoute.tsx
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { CircularProgress, Box } from '@mui/material'

/**
 * 🔓 محافظ مسیرهای عمومی
 * اگر کاربر لاگین کرده باشه، به داشبورد ریدایرکت می‌شه
 */
interface PublicRouteProps {
    children: React.ReactNode
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth()

    console.log('🔓 PublicRoute - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading)

    // ⏳ در حال بارگذاری
    if (isLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh'
                }}
            >
                <CircularProgress />
            </Box>
        )
    }

    // ✅ اگر لاگین کرده، به داشبورد بره
    if (isAuthenticated) {
        console.log('✅ User is authenticated, redirecting to /dashboard')
        return <Navigate to="/dashboard" replace />
    }

    // ❌ اگر لاگین نکرده، صفحه رو نشون بده
    return <>{children}</>
}

export default PublicRoute
