import { lazy, Suspense } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import MainLayout from '@/layout/MainLayout'
import { CircularProgress, Box } from '@mui/material'

// 📦 Lazy import
const UsersList = lazy(() => import('@/pages/UsersList'))
const SendOtp = lazy(() => import('@/pages/SendOtp'))
const VerifyOtp = lazy(() => import('@/pages/VerifyOtp'))
const CompleteRegistration = lazy(() => import('@/pages/CompleteRegistration'))

// 💫 Loader مشترک برای صفحات در حال بارگذاری
function Loader() {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
            }}
        >
            <CircularProgress sx={{ color: 'primary.main' }} />
        </Box>
    )
}

export default function AppRoutes() {
    return (
        <Routes>
            {/* تمام صفحات جهت استفاده از تم و AppBar اصلی زیر MainLayout */}
            <Route element={<MainLayout />}>
                <Route
                    path="/usersList"
                    element={
                        <Suspense fallback={<Loader />}>
                            <UsersList />
                        </Suspense>
                    }
                />

                {/* 🔹 افزودن صفحات OTP تحت MainLayout */}
                <Route
                    path="/send-otp"
                    element={
                        <Suspense fallback={<Loader />}>
                            <SendOtp />
                        </Suspense>
                    }
                />

                <Route
                    path="/verify-otp"
                    element={
                        <Suspense fallback={<Loader />}>
                            <VerifyOtp />
                        </Suspense>
                    }
                />

                <Route
                    path="/complete-registration"
                    element={
                        <Suspense fallback={<Loader />}>
                            <CompleteRegistration />
                        </Suspense>
                    }
                />

                {/* ⚠️ مسیر پیش‌فرض */}
                <Route path="*" element={<Navigate to="/send-otp" replace />} />
            </Route>
        </Routes>
    )
}
