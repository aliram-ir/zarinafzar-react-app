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

    // وضعیت کاربر لاگین شده فعلی
    const [user, setUser] = useState<UserDto | null>(null)

    // وضعیت لود اولیه
    const [isLoading, setIsLoading] = useState(true)

    // رفرش کاربر از سرور
    const refreshAuth = useCallback(async () => {
        const token = localStorage.getItem('accessToken')

        if (!token) {
            setUser(null)
            setIsLoading(false)
            return
        }

        try {
            const result = await getCurrentUser()

            if (result.success && result.data) {
                setUser(result.data)
            } else {
                setUser(null)
                localStorage.removeItem('accessToken')
            }
        } catch {
            setUser(null)
            localStorage.removeItem('accessToken')
        } finally {
            setIsLoading(false)
        }
    }, [])

    // خروج کاربر
    const logout = useCallback(async () => {
        try {
            await logoutService()
        }
        finally {
            setUser(null)
            localStorage.removeItem('accessToken')
        }
    }, [])

    // بارگذاری اولیه
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

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext
