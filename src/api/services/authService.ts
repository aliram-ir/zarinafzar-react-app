// 📁 src/api/services/authService.ts
import api from '../apiService'
import type { ApiResponse } from '../apiService'

/** ✉️ ارسال OTP */
export interface SendOtpRequest { phoneNumber: string }
export type SendOtpResponse = ApiResponse<null>

/** ✅ تأیید OTP */
export interface VerifyOtpRequest { phoneNumber: string; otpCode: string }
export type VerifyOtpResponse = ApiResponse<boolean>

/** 📝 ثبت‌نام نهایی */
export interface CompleteRegistrationRequest {
    phoneNumber: string
    fullName: string
    email: string
    password: string
}
export type CompleteRegistrationResponse = ApiResponse<null>

export async function sendOtp(payload: SendOtpRequest): Promise<SendOtpResponse> {
    const { data } = await api.post<ApiResponse<null>>('Auth/send-otp', payload)
    return data
}

export async function verifyOtp(payload: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    const { data } = await api.post<ApiResponse<boolean>>('Auth/verify-otp', payload)
    return data
}

export async function completeRegistration(
    payload: CompleteRegistrationRequest
): Promise<CompleteRegistrationResponse> {
    const { data } = await api.post<ApiResponse<null>>('Auth/register-user', payload)
    return data
}
