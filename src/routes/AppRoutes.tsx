import { lazy, Suspense } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import MainLayout from '@/layout/MainLayout'
import { CircularProgress, Box } from '@mui/material'
import ProtectedRoute from '@/routes/ProtectedRoute'

// 📦 Lazy import
const UsersList = lazy(() => import('@/pages/UsersList'))
const SendOtp = lazy(() => import('@/pages/SendOtp'))
const VerifyOtp = lazy(() => import('@/pages/VerifyOtp'))
const CompleteRegistration = lazy(() => import('@/pages/CompleteRegistration'))
const Login = lazy(() => import('@/pages/Login'))

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
                {/* 🔐 صفحه لاگین - بدون نیاز به احراز هویت */}
                <Route
                    path="/login"
                    element={
                        <Suspense fallback={<Loader />}>
                            <Login />
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

                {/* 🔒 صفحات محافظت شده - نیاز به لاگین */}
                <Route
                    path="/usersList"
                    element={
                        <ProtectedRoute>
                            <Suspense fallback={<Loader />}>
                                <UsersList />
                            </Suspense>
                        </ProtectedRoute>
                    }
                />

                {/* ⚠️ مسیر پیش‌فرض */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Route>
        </Routes>
    )
}
