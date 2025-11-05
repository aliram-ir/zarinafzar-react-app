import { lazy, Suspense } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import MainLayout from '@/layout/MainLayout'
import { CircularProgress, Box } from '@mui/material'

// 🚀 Lazy loading صفحات
// const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const UsersList = lazy(() => import('@/pages/UsersList'))
// const UsersPage = lazy(() => import('@/pages/UsersPage'))
// const ProductsPage = lazy(() => import('@/pages/ProductsPage'))
// const SettingsPage = lazy(() => import('@/pages/SettingsPage'))

export default function AppRoutes() {
    return (
        <Routes>
            {/* تمام صفحات زیر از layout اصلی استفاده می‌کنن */}
            <Route element={<MainLayout />}>
                {/* <Route
                    path="/"
                    element={
                        <Suspense fallback={<Loader />}>
                            <DashboardPage />
                        </Suspense>
                    }
                /> */}

                {/* <Route
                    path="/users"
                    element={
                        <Suspense fallback={<Loader />}>
                            <UsersPage />
                        </Suspense>
                    }
                /> */}

                <Route
                    path="/users/list"
                    element={
                        <Suspense fallback={<Loader />}>
                            <UsersList />
                        </Suspense>
                    }
                />

                {/* <Route
                    path="/products"
                    element={
                        <Suspense fallback={<Loader />}>
                            <ProductsPage />
                        </Suspense>
                    }
                /> */}

                {/* <Route
                    path="/settings"
                    element={
                        <Suspense fallback={<Loader />}>
                            <SettingsPage />
                        </Suspense>
                    }
                /> */}

                {/* ریدایرکت مسیر نامعتبر به داشبورد */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    )
}

// 💫 کامپوننت Loader مرکزی
function Loader() {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                direction: 'rtl',
            }}
        >
            <CircularProgress sx={{ color: 'primary.main' }} />
        </Box>
    )
}
