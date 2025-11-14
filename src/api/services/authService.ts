// 📁 src/api/services/authService.ts
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

// 🔹 بازیابی حالت انتقال از storage
let transportMode: 'cookie' | 'body' =
    (localStorage.getItem('transport_mode') as 'cookie' | 'body') || 'cookie'

// ---- اینترفیس نتیجه لاگین ----
export interface AuthResult {
    accessToken: string
    expiresAt: string
    userInfo: UserDto
    refreshToken?: string
    sessionId?: string
}

// -----------------------------------------------------
// 🔐 ورود کاربر با تشخیص خودکار
// -----------------------------------------------------
export const login = async (phoneNumber: string, password: string): Promise<AuthResult> => {
    console.log('📞 [LOGIN] Calling login API:', { phoneNumber })

    try {
        const result = await postResult<AuthResult>(
            '/Auth/login',
            { phoneNumber, password }
        )

        console.log('📦 [LOGIN] Response received:', {
            hasAccessToken: !!result?.accessToken,
            refreshTokenValue: result?.refreshToken,
            refreshTokenLength: result?.refreshToken?.length || 0
        })

        // ⚠️ چک کردن وجود accessToken
        if (!result || !result.accessToken) {
            console.error('❌ [LOGIN] No accessToken in response!')
            throw new Error('پاسخ سرور فاقد توکن دسترسی است')
        }

        // ✅ ذخیره accessToken
        localStorage.setItem('accessToken', result.accessToken)
        console.log('💾 [LOGIN] AccessToken saved')

        // 🎯 تشخیص هوشمند: اگه refreshToken پُر بود → Body، خالی بود → Cookie
        if (result.refreshToken && result.refreshToken.trim().length > 0) {
            console.log('🔧 [LOGIN] RefreshToken detected → Using BODY mode')
            transportMode = 'body'
            localStorage.setItem('refresh_token', result.refreshToken)
            localStorage.setItem('transport_mode', 'body')
        } else {
            console.log('🍪 [LOGIN] No RefreshToken in body → Using COOKIE mode')
            transportMode = 'cookie'
            localStorage.setItem('transport_mode', 'cookie')
            // پاک کردن refresh_token قدیمی در صورت وجود
            localStorage.removeItem('refresh_token')
        }

        console.log('✅ [LOGIN] Login completed, mode:', transportMode)
        return result

    } catch (error) {
        console.error('❌ [LOGIN] Login failed:', error)
        throw error
    }
}

// -----------------------------------------------------
// 🔄 رفرش توکن (Hybrid Mode)
// -----------------------------------------------------
export const refreshAccessToken = async (): Promise<AuthResult | null> => {
    const currentTransportMode = localStorage.getItem('transport_mode') || 'cookie'
    const refreshToken = localStorage.getItem('refresh_token')

    console.log('🔄 [REFRESH] Starting refresh:', {
        mode: currentTransportMode,
        hasRefreshToken: !!refreshToken,
        refreshTokenPreview: refreshToken ? refreshToken.substring(0, 20) + '...' : 'null'
    })

    try {
        if (currentTransportMode === 'cookie') {
            console.log('🍪 [REFRESH] Using cookie mode')
            const result = await postResult<AuthResult>('/Auth/refresh-token', {})

            if (result?.accessToken) {
                localStorage.setItem('accessToken', result.accessToken)
                console.log('✅ [REFRESH] Token refreshed (cookie mode)')
            }

            return result
        }

        if (currentTransportMode === 'body') {
            if (!refreshToken) {
                console.error('❌ [REFRESH] Body mode but no refresh token!')
                return null
            }

            console.log('📦 [REFRESH] Using body mode')
            const result = await postResult<AuthResult>('/Auth/refresh-token', { refreshToken })

            if (result?.accessToken) {
                localStorage.setItem('accessToken', result.accessToken)
                console.log('✅ [REFRESH] Token refreshed (body mode)')

                // اگه refreshToken جدید اومد، اونو هم آپدیت کن
                if (result.refreshToken && result.refreshToken.trim().length > 0) {
                    localStorage.setItem('refresh_token', result.refreshToken)
                    console.log('🔄 [REFRESH] New refreshToken saved')
                }
            }

            return result
        }
    } catch (error: unknown) {
        const axiosError = error as AxiosError<ApiResponse<AuthResult>>

        console.error('❌ [REFRESH] Refresh failed:', {
            status: axiosError?.response?.status,
            mode: currentTransportMode
        })

        // 🔄 Fallback: اگه cookie mode شکست خورد، body رو امتحان کن
        if (axiosError?.response?.status === 401 && currentTransportMode === 'cookie') {
            console.warn('⚠️ [REFRESH] Cookie mode failed, trying body mode fallback')

            if (refreshToken) {
                try {
                    transportMode = 'body'
                    localStorage.setItem('transport_mode', 'body')

                    const result = await postResult<AuthResult>('/Auth/refresh-token', { refreshToken })

                    if (result?.accessToken) {
                        localStorage.setItem('accessToken', result.accessToken)
                        console.log('✅ [REFRESH] Fallback successful')
                    }

                    return result
                } catch (fallbackError) {
                    console.error('❌ [REFRESH] Fallback also failed:', fallbackError)
                    throw fallbackError
                }
            }
        }

        throw error
    }

    return null
}

// -----------------------------------------------------
// 🚪 خروج از حساب
// -----------------------------------------------------
export const logout = async (): Promise<boolean> => {
    const currentTransportMode = localStorage.getItem('transport_mode') || 'cookie'

    console.log('🚪 [LOGOUT] Starting logout, mode:', currentTransportMode)

    try {
        if (currentTransportMode === 'body') {
            const token = localStorage.getItem('refresh_token')

            if (token) {
                await postResult<boolean>('/Auth/logout', { refreshToken: token })
            } else {
                await postResult<boolean>('/Auth/logout', {})
            }

            // پاکسازی اطلاعات client
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('transport_mode')
            transportMode = 'cookie'
            console.log('✅ [LOGOUT] Completed (body mode)')
            return true
        }

        // Cookie mode logout
        await postResult<boolean>('/Auth/logout', {})
        localStorage.removeItem('accessToken')
        localStorage.removeItem('transport_mode')
        console.log('✅ [LOGOUT] Completed (cookie mode)')
        return true
    } catch (error) {
        console.error('❌ [LOGOUT] Error:', error)

        // ✅ حتی در صورت خطا، localStorage رو پاک کن
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('transport_mode')

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
// 🧩 بررسی شماره موبایل
// -----------------------------------------------------
export const checkPhoneExist = (phoneNumber: string) =>
    getResult<boolean>('/Auth/IsExist-PhoneNumber', { params: { phoneNumber } })

// -----------------------------------------------------
// 📝 تکمیل ثبت‌نام
// -----------------------------------------------------
export const completeRegistration = (payload: CompleteRegistrationRequest) =>
    postResult<CompleteRegistrationResponse>('Auth/register-user', payload)
