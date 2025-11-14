// 📁 src/routes/AppRoutes.tsx
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from '@/layout/MainLayout'
import DashboardLayout from '@/layout/DashboardLayout'
import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'

// 📄 صفحات عمومی
import Login from '@/pages/Login'
import SendOtp from '@/pages/SendOtp'
import VerifyOtp from '@/pages/VerifyOtp'
import CompleteRegistration from '@/pages/CompleteRegistration'

// 📄 صفحات داشبورد
import DashboardHome from '@/pages/panel/DashboardHome'
import UsersList from '@/pages/UsersList'
import RolesList from '@/pages/panel/RolesList'
import PermissionsList from '@/pages/panel/PermissionsList'

/**
 * 🛣️ مسیریابی اصلی اپلیکیشن
 */
const AppRoutes: React.FC = () => {
    return (
        <Routes>
            {/* 🔓 مسیرهای عمومی */}
            <Route element={<MainLayout />}>
                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/send-otp"
                    element={
                        <PublicRoute>
                            <SendOtp />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/verify-otp"
                    element={
                        <PublicRoute>
                            <VerifyOtp />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/complete-registration"
                    element={
                        <PublicRoute>
                            <CompleteRegistration />
                        </PublicRoute>
                    }
                />
            </Route>

            {/* 🔐 مسیرهای محافظت شده (داشبورد) */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="roles" element={<RolesList />} />
                <Route path="Permissions" element={<PermissionsList />} />
                <Route index element={<DashboardHome />} />
                <Route path="users" element={<UsersList />} />
                <Route path="settings" element={<div>تنظیمات</div>} />
                <Route path="profile" element={<div>پروفایل</div>} />
            </Route>

            {/* 🏠 ریدایرکت صفحه اصلی */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* ❌ صفحه 404 */}
            <Route path="*" element={<div>صفحه مورد نظر یافت نشد</div>} />
        </Routes>
    )
}

export default AppRoutes
