// 📁 مسیر: src/api/services/authService.ts
import api from '../apiService'
import type {
    SendOtpRequest,
    SendOtpResponse,
    VerifyOtpRequest,
    VerifyOtpResponse,
    CompleteRegistrationRequest,
    CompleteRegistrationResponse,
} from '@/types/auth'

// ✅ تعریف Type برای Login
export interface LoginRequest {
    phoneNumber: string
    password: string
}

export interface UserInfoModel {
    id: string
    phoneNumber: string
    fullName: string
    roles: string[]
}

export interface AuthResult {
    accessToken: string
    refreshToken: string
    expiresAt: string
    sessionId?: string
    userInfo: UserInfoModel
}

// 🚀 توابع بک‌اند
/**
 * 📲 ارسال کد یکبار مصرف (OTP) به شماره موبایل.
 */
export async function sendOtp(payload: SendOtpRequest): Promise<SendOtpResponse> {
    const { data } = await api.post<SendOtpResponse>('Auth/send-otp', payload)
    return data
}

/**
 * 🔑 تأیید کد OTP ارسال شده.
 */
export async function verifyOtp(payload: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    const { data } = await api.post<VerifyOtpResponse>('Auth/verify-otp', payload)
    return data
}

/**
 * 🧩 بررسی وجود شماره موبایل در سیستم.
 */
export const checkPhoneExist = async (phoneNumber: string) => {
    const response = await api.get('/Auth/IsExist-PhoneNumber', {
        params: { phoneNumber },
    })
    return response.data
}

/**
 * 📝 تکمیل نهایی ثبت‌نام و ایجاد کاربر جدید.
 */
export async function completeRegistration(payload: CompleteRegistrationRequest): Promise<CompleteRegistrationResponse> {
    const { data } = await api.post<CompleteRegistrationResponse>('Auth/register-user', payload)
    return data
}

/**
 * 🔐 ورود کاربر و دریافت توکن JWT
 */
export async function loginUser(payload: LoginRequest): Promise<AuthResult> {
    const { data } = await api.post<AuthResult>('Auth/login', payload)
    return data
}
