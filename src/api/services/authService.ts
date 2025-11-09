// 📁 src/api/services/authService.ts
import { getResult, postResult } from '../apiHelper'
import type {
    SendOtpRequest,
    SendOtpResponse,
    VerifyOtpRequest,
    VerifyOtpResponse,
    CompleteRegistrationRequest,
    CompleteRegistrationResponse,
} from '@/types/auth'
import type { UserDto } from '@/types/userDto'

/**
 * مدل درخواست ورود
 */
export interface LoginRequest {
    phoneNumber: string
    password: string
}

/**
 * مدل پاسخ احراز هویت
 */
export interface AuthResult {
    accessToken: string
    expiresAt: string
    userInfo: UserDto
}

/**
 * 🔐 ورود با شماره تلفن و رمز عبور
 */
export const login = (phoneNumber: string, password: string) =>
    postResult<AuthResult>('/Auth/login', { phoneNumber, password })

/**
 * 👤 دریافت اطلاعات کاربر جاری
 */
export const getCurrentUser = () => getResult<UserDto>('/Auth/current')

/**
 * 🚪 خروج از حساب کاربری
 */
export const logout = () => postResult<void>('/Auth/logout', {})

/**
 * 🔄 رفرش توکن دسترسی
 */
export const refreshAccessToken = () =>
    postResult<AuthResult>('/Auth/refresh-token', {})

/**
 * 📲 ارسال کد OTP
 */
export const sendOtp = (payload: SendOtpRequest) =>
    postResult<SendOtpResponse>('Auth/send-otp', payload)

/**
 * 🔑 تأیید کد OTP
 */
export const verifyOtp = (payload: VerifyOtpRequest) =>
    postResult<VerifyOtpResponse>('Auth/verify-otp', payload)

/**
 * 🧩 بررسی وجود شماره موبایل
 */
export const checkPhoneExist = (phoneNumber: string) =>
    getResult<boolean>('/Auth/IsExist-PhoneNumber', { params: { phoneNumber } })

/**
 * 📝 تکمیل ثبت‌نام
 */
export const completeRegistration = (payload: CompleteRegistrationRequest) =>
    postResult<CompleteRegistrationResponse>('Auth/register-user', payload)
