// 📁 مسیر: src/api/services/authService.ts
import api from '../apiService'
// 🎯 ایمپورت از Typeهای جداگانه
import type {
    SendOtpRequest,
    SendOtpResponse,
    VerifyOtpRequest,
    VerifyOtpResponse,
    CompleteRegistrationRequest,
    CompleteRegistrationResponse,
} from '@/types/auth'

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

export const checkPhoneExist = async (phoneNumber: string) => {
    const response = await api.get('/Auth/IsExist-PhoneNumber', {
        params: { phoneNumber },
    })
    return response.data
}

/**
 * 📝 تکمیل نهایی ثبت‌نام و ایجاد کاربر.
 */
export async function completeRegistration(payload: CompleteRegistrationRequest): Promise<CompleteRegistrationResponse> {
    const { data } = await api.post<CompleteRegistrationResponse>('Auth/register-user', payload)
    return data
}
