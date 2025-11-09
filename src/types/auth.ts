// 📁 مسیر: src/types/auth.ts
import type { ApiResponse } from './apiResponse' // 💡 فرض می‌کنم ApiResponse در این مسیر است

/* -------------------------------------------------------------------------- */
/* 📦 مدل‌های احراز هویت (Auth Models)                                       */
/* -------------------------------------------------------------------------- */

export interface LoginRequest {
    phoneNumber: string
    password: string
}

export interface RefreshTokenRequest {
    userId: string
    refreshToken: string
}

export interface RevokeTokenRequest {
    userId: string
    refreshToken: string
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
    firstName: string
    lastName: string
    nationalCode: string | null // string? در C#
    email: string
    phoneNumber: string
    password: string
    confirmPassword: string // ⚠️ برای اعتبارسنجی [Compare("Password")] در بک‌اند لازم است
    createdAt: string // ⚠️ برای تطابق DTO بک‌اند (ارسال تاریخ به فرمت ISO)
    roleId: string | null // ⚠️ برای تطابق DTO بک‌اند
}
export type CompleteRegistrationResponse = ApiResponse<null>
