// 📁 src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, useCallback } from 'react'
import { getCurrentUser, logout as logoutService } from '@/api/services/authService'
import type { UserDto } from '@/types/userDto'

/**
 * نوع کانتکست احراز هویت
 */
interface AuthContextType {
    user: UserDto | null
    isAuthenticated: boolean
    isLoading: boolean
    setUser: (user: UserDto | null) => void
    logout: () => Promise<void>
    refreshAuth: () => Promise<void>
}

/**
 * ایجاد کانتکست احراز هویت
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Provider اصلی احراز هویت
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserDto | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    /**
     * بارگذاری اطلاعات کاربر از سرور
     */
    const refreshAuth = useCallback(async () => {
        const token = localStorage.getItem('accessToken')

        console.log('🔄 refreshAuth called, token:', token ? 'exists' : 'null')

        if (!token) {
            setUser(null)
            setIsLoading(false)
            return
        }

        try {
            const userData = await getCurrentUser()
            console.log('✅ User data loaded:', userData)
            setUser(userData)
        } catch (error) {
            console.error('❌ خطا در بارگذاری اطلاعات کاربر:', error)
            setUser(null)
            // ✅ پاکسازی کامل در صورت خطا
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('transport_mode')
        } finally {
            setIsLoading(false)
        }
    }, [])

    /**
     * خروج از حساب کاربری
     */
    const logout = useCallback(async () => {
        try {
            await logoutService()
            console.log('✅ Logout service completed')
        } catch (error) {
            console.error('❌ خطا در خروج:', error)
        } finally {
            // ✅ پاکسازی کامل state و localStorage (همیشه اجرا میشه)
            setUser(null)
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('transport_mode')
            console.log('🧹 AuthContext cleaned up')
        }
    }, [])

    /**
     * بارگذاری اولیه در هنگام mount
     */
    useEffect(() => {
        refreshAuth()
    }, [refreshAuth])

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        setUser,
        logout,
        refreshAuth,
    }

    console.log('🔍 AuthContext value:', {
        hasUser: !!user,
        isAuthenticated: !!user,
        isLoading
    })

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
