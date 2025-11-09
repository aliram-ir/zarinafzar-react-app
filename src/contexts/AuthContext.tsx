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

        if (!token) {
            setUser(null)
            setIsLoading(false)
            return
        }

        try {
            // ✅ getCurrentUser از apiHelper استفاده می‌کنه که خودش ApiResponse رو هندل می‌کنه
            const userData = await getCurrentUser()
            setUser(userData)
        } catch (error) {
            console.error('خطا در بارگذاری اطلاعات کاربر:', error)
            setUser(null)
            localStorage.removeItem('accessToken')
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
        } catch (error) {
            console.error('خطا در خروج:', error)
        } finally {
            setUser(null)
            localStorage.removeItem('accessToken')
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

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
