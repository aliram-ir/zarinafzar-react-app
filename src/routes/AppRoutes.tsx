// 📁 src/routes/AppRoutes.tsx
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from '@/layout/MainLayout'
import ProtectedRoute from '@/routes/ProtectedRoute'

// صفحات
import Login from '@/pages/Login'
import SendOtp from '@/pages/SendOtp'
import VerifyOtp from '@/pages/VerifyOtp'
import CompleteRegistration from '@/pages/CompleteRegistration'
import UsersList from '@/pages/UsersList'

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            {/* ✅ Layout اصلی */}
            <Route element={<MainLayout />}>
                {/* مسیرهای عمومی */}
                <Route path="/login" element={<Login />} />
                <Route path="/send-otp" element={<SendOtp />} />
                <Route path="/verify-otp" element={<VerifyOtp />} />
                <Route path="/complete-registration" element={<CompleteRegistration />} />
                <Route path="/usersList" element={<UsersList />} />

                {/* مسیرهای محافظت شده */}
                <Route
                    path="/usersList"
                    element={
                        <ProtectedRoute>
                            <UsersList />
                        </ProtectedRoute>
                    }
                />

                {/* مسیر پیش‌فرض */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Route>
        </Routes>
    )
}

export default AppRoutes
