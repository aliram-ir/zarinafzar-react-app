// 📁 src/api/services/authService.ts
// =====================================================
// ✅ نسخه‌ی نهایی "Hybrid Refresh Token" با پشتیبانی از
//    Cookie + Body + Auto Fallback و پایداری transportMode
// =====================================================

import { getResult, postResult } from '../apiHelper'
import type { UserDto } from '@/types/userDto'
import type {
    SendOtpRequest,
    SendOtpResponse,
    VerifyOtpRequest,
    VerifyOtpResponse,
    CompleteRegistrationRequest,
    CompleteRegistrationResponse,
} from '@/types/auth'
import type { AxiosError } from 'axios'
import type { ApiResponse } from '@/types/apiResponse'

// 🔹 بازیابی حالت انتقال از storage (پایدار بین refreshهای صفحه)
let transportMode: 'cookie' | 'body' =
    (localStorage.getItem('transport_mode') as 'cookie' | 'body') || 'cookie'

// ---- اینترفیس نتیجه لاگین ----
export interface AuthResult {
    accessToken: string
    expiresAt: string
    userInfo: UserDto
    refreshToken?: string
}

// -----------------------------------------------------
// 🔐 ورود کاربر
// -----------------------------------------------------
export const login = async (phoneNumber: string, password: string) => {
    const res = await postResult<{ data: AuthResult; transport?: string }>(
        '/Auth/login',
        { phoneNumber, password }
    )

    // بروزرسانی transportMode بر اساس پاسخ سرور
    transportMode = res.transport?.toLowerCase() === 'body' ? 'body' : 'cookie'
    localStorage.setItem('transport_mode', transportMode)

    // 💡 تشخیص خودکار عدم پذیرش کوکی توسط مرورگر
    try {
        document.cookie = 'cookie_test=1'
        const cookieEnabled = document.cookie.includes('cookie_test=')
        if (!cookieEnabled && transportMode === 'cookie') {
            console.warn('🚫 Cookies disabled, switching to body transport.')
            transportMode = 'body'
            localStorage.setItem('transport_mode', 'body')
        }
    } catch {
        transportMode = 'body'
        localStorage.setItem('transport_mode', 'body')
    }

    // در حالت بدنه توکن را ذخیره کن
    if (transportMode === 'body' && res.data?.refreshToken)
        localStorage.setItem('refresh_token', res.data.refreshToken)

    return res.data
}

// -----------------------------------------------------
// 🔄 رفرش توکن با هماهنگی کامل بک‌اند
// -----------------------------------------------------
export const refreshAccessToken = async (): Promise<AuthResult | null> => {
    const refreshToken = localStorage.getItem('refresh_token')

    try {
        if (transportMode === 'cookie')
            return await postResult<AuthResult>('/Auth/refresh-token', {})

        if (transportMode === 'body') {
            if (!refreshToken) {
                console.warn('⚠️ No refresh token found locally.')
                return null
            }
            return await postResult<AuthResult>('/Auth/refresh-token', { refreshToken })
        }
    } catch (error: unknown) {
        const axiosError = error as AxiosError<ApiResponse<AuthResult>>

        if (axiosError?.response?.status === 401 && transportMode === 'cookie') {
            console.warn('⚠️ Cookie mode refresh failed, fallback to body mode.')

            transportMode = 'body'
            localStorage.setItem('transport_mode', 'body')

            if (refreshToken)
                return await postResult<AuthResult>('/Auth/refresh-token', { refreshToken })
        }

        throw error
    }

    return null
}

// -----------------------------------------------------
// 🚪 خروج از حساب (Hybrid)
// -----------------------------------------------------
export const logout = async (): Promise<boolean> => {
    try {
        if (transportMode === 'body') {
            const token = localStorage.getItem('refresh_token')

            if (token)
                await postResult<boolean>('/Auth/logout', { refreshToken: token })
            else
                await postResult<boolean>('/Auth/logout', {})

            // پاکسازی اطلاعات client
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('transport_mode')
            transportMode = 'cookie'
            return true
        }

        // Cookie mode logout
        await postResult<boolean>('/Auth/logout', {})
        localStorage.removeItem('transport_mode')
        return true
    } catch (error) {
        console.error('❌ Logout error:', error)
        return false
    }
}

// -----------------------------------------------------
// 👤 اطلاعات کاربر جاری
// -----------------------------------------------------
export const getCurrentUser = () => getResult<UserDto>('/Auth/current')

// -----------------------------------------------------
// 📲 OTP operations
// -----------------------------------------------------
export const sendOtp = (payload: SendOtpRequest) =>
    postResult<SendOtpResponse>('Auth/send-otp', payload)

export const verifyOtp = (payload: VerifyOtpRequest) =>
    postResult<VerifyOtpResponse>('Auth/verify-otp', payload)

// -----------------------------------------------------
// 🧩 بررسی شماره موبایل برای ثبت‌نام
// -----------------------------------------------------
export const checkPhoneExist = (phoneNumber: string) =>
    getResult<boolean>('/Auth/IsExist-PhoneNumber', { params: { phoneNumber } })

// -----------------------------------------------------
// 📝 تکمیل ثبت‌نام
// -----------------------------------------------------
export const completeRegistration = (payload: CompleteRegistrationRequest) =>
    postResult<CompleteRegistrationResponse>('Auth/register-user', payload)
