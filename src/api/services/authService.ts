// 📁 src/api/authService.ts
import api from '.././apiService'

// ✅ ساختار پایه‌ای پاسخ سرور (همه endpointها)
export interface ApiResponse<T> {
    success: boolean
    message: string
    data: T
    details?: string | null
    traceId?: string | null
}

// ✉️ درخواست ارسال OTP
export interface SendOtpRequest {
    phoneNumber: string
}
export type SendOtpResponse = ApiResponse<null>

// 🔍 درخواست و پاسخ وریفای OTP
export interface VerifyOtpRequest {
    phoneNumber: string
    otpCode: string
}
export type VerifyOtpResponse = ApiResponse<boolean>

// 📝 درخواست و پاسخ ثبت‌نام نهایی
export interface CompleteRegistrationRequest {
    phoneNumber: string
    fullName: string
    email: string
    password: string
}
export type CompleteRegistrationResponse = ApiResponse<null>

// --------------------------------------------------------------
// 🚀 توابع API
// --------------------------------------------------------------

/**
 * ✉️ ارسال کد OTP
 */
export async function sendOtp(payload: SendOtpRequest): Promise<SendOtpResponse> {
    const { data } = await api.post<SendOtpResponse>('Auth/send-otp', payload)
    return data
}

/**
 * 🔍 تأیید کد دریافت‌شده
 */
export async function verifyOtp(payload: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    const { data } = await api.post<VerifyOtpResponse>('Auth/verify-otp', payload)
    return data
}

/**
 * 📝 تکمیل اطلاعات ثبت‌نام
 */
export async function completeRegistration(
    payload: CompleteRegistrationRequest
): Promise<CompleteRegistrationResponse> {
    const { data } = await api.post<CompleteRegistrationResponse>(
        'Auth/register-user',
        payload
    )
    return data
}
