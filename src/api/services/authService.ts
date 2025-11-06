// 📁 src/api/services/authService.ts
import api from '../apiService'
import type { ApiResponse } from '@/types/apiResponse'

// ✉️ درخواست ارسال OTP
export interface SendOtpRequest {
    phoneNumber: string
}
export type SendOtpResponse = ApiResponse<null>

// 🔍 تأیید OTP
export interface VerifyOtpRequest {
    phoneNumber: string
    otpCode: string
}
export type VerifyOtpResponse = ApiResponse<boolean>

// 📝 تکمیل اطلاعات ثبت‌نام
export interface CompleteRegistrationRequest {
    phoneNumber: string
    fullName: string
    email: string
    password: string
}
export type CompleteRegistrationResponse = ApiResponse<null>

// 🚀 توابع بک‌اند
export async function sendOtp(payload: SendOtpRequest): Promise<SendOtpResponse> {
    const { data } = await api.post<SendOtpResponse>('Auth/send-otp', payload)
    return data
}

export async function verifyOtp(payload: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    const { data } = await api.post<VerifyOtpResponse>('Auth/verify-otp', payload)
    return data
}

export async function completeRegistration(payload: CompleteRegistrationRequest): Promise<CompleteRegistrationResponse> {
    const { data } = await api.post<CompleteRegistrationResponse>('Auth/register-user', payload)
    return data
}
