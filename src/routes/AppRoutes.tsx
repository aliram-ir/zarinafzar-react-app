// 📁 src/routes/AppRoutes.tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from '@/layout/MainLayout'
import DashboardLayout from '@/layout/DashboardLayout'
import ProtectedRoute from './ProtectedRoute'
import Login from '@/pages/Login'
import SendOtp from '@/pages/SendOtp'
import VerifyOtp from '@/pages/VerifyOtp'
import CompleteRegistration from '@/pages/CompleteRegistration'
import UsersList from '@/pages/UsersList'
import DashboardHome from '@/pages/panel/DashboardHome'

export default function AppRoutes() {
    return (
        <Routes>
            {/* 🔓 روت‌های عمومی */}
            <Route element={<MainLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/send-otp" element={<SendOtp />} />
                <Route path="/verify-otp" element={<VerifyOtp />} />
                <Route path="/complete-registration" element={<CompleteRegistration />} />
            </Route>

            {/* 🔐 روت‌های محافظت شده - داشبورد */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<DashboardHome />} />
                <Route path="users" element={<UsersList />} />
                <Route path="settings" element={
                    <div style={{ padding: '20px' }}>
                        <h2>تنظیمات</h2>
                        <p>صفحه تنظیمات در دست ساخت است...</p>
                    </div>
                } />
                <Route path="profile" element={
                    <div style={{ padding: '20px' }}>
                        <h2>پروفایل کاربری</h2>
                        <p>صفحه پروفایل در دست ساخت است...</p>
                    </div>
                } />
            </Route>

            {/* ریدایرکت اصلی */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    )
}
