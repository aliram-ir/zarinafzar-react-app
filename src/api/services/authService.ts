// 📁 src/api/services/authService.ts
import api, { type ApiResponse } from '../apiService'
import type {
    SendOtpRequest,
    SendOtpResponse,
    VerifyOtpRequest,
    VerifyOtpResponse,
    CompleteRegistrationRequest,
    CompleteRegistrationResponse,
} from '@/types/auth'
import type { UserDto } from '@/types/userDto'

// ✅ مدل‌های Login
export interface LoginRequest {
    phoneNumber: string
    password: string
}

export interface AuthResult {
    accessToken: string
    expiresAt: string
    userInfo: UserDto
}

/**
 * 🔐 ورود با شماره تلفن و رمز عبور
 * RefreshToken به صورت HttpOnly Cookie ذخیره می‌شود
 */
export async function login(
    phoneNumber: string,
    password: string
): Promise<ApiResponse<AuthResult>> {
    const response = await api.post<ApiResponse<AuthResult>>(
        '/Auth/login',
        {
            phoneNumber,
            password,
        },
        {
            withCredentials: true,
        }
    )
    return response.data
}

/**
 * 👤 دریافت اطلاعات کاربر فعلی
 */
export async function getCurrentUser(): Promise<ApiResponse<UserDto>> {
    const response = await api.get<ApiResponse<UserDto>>('/Auth/current', {
        withCredentials: true,
    })
    return response.data
}

/**
 * 🚪 خروج از حساب کاربری
 */
export async function logout(): Promise<ApiResponse<void>> {
    const response = await api.post<ApiResponse<void>>(
        '/Auth/logout',
        {},
        {
            withCredentials: true,
        }
    )
    return response.data
}

/**
 * 🔄 رفرش کردن AccessToken
 */
export async function refreshAccessToken(): Promise<ApiResponse<AuthResult>> {
    const response = await api.post<ApiResponse<AuthResult>>(
        '/Auth/refresh-token',
        {},
        {
            withCredentials: true,
        }
    )
    return response.data
}

/**
 * 📲 ارسال OTP
 */
export async function sendOtp(payload: SendOtpRequest): Promise<SendOtpResponse> {
    const { data } = await api.post<SendOtpResponse>('Auth/send-otp', payload)
    return data
}

/**
 * 🔑 تأیید OTP
 */
export async function verifyOtp(payload: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    const { data } = await api.post<VerifyOtpResponse>('Auth/verify-otp', payload)
    return data
}

/**
 * 🧩 بررسی وجود شماره موبایل
 */
export const checkPhoneExist = async (phoneNumber: string) => {
    const response = await api.get('/Auth/IsExist-PhoneNumber', {
        params: { phoneNumber },
    })
    return response.data
}

/**
 * 📝 تکمیل ثبت‌نام
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



// // 📁 مسیر: src/api/services/authService.ts
// import api from '../apiService'
// import type {
//     SendOtpRequest,
//     SendOtpResponse,
//     VerifyOtpRequest,
//     VerifyOtpResponse,
//     CompleteRegistrationRequest,
//     CompleteRegistrationResponse,
//     LoginRequest,
//     RefreshTokenRequest,
//     RevokeTokenRequest,
//     AuthResult,
//     UserInfoModel,
// } from '@/types/auth'


// // 🚀 توابع بک‌اند
// /**
//  * 📲 ارسال کد یکبار مصرف (OTP) به شماره موبایل.
//  */
// export async function sendOtp(payload: SendOtpRequest): Promise<SendOtpResponse> {
//     const { data } = await api.post<SendOtpResponse>('Auth/send-otp', payload)
//     return data
// }

// /**
//  * 🔑 تأیید کد OTP ارسال شده.
//  */
// export async function verifyOtp(payload: VerifyOtpRequest): Promise<VerifyOtpResponse> {
//     const { data } = await api.post<VerifyOtpResponse>('Auth/verify-otp', payload)
//     return data
// }

// /**
//  * 🧩 بررسی وجود شماره موبایل در سیستم.
//  */
// export const checkPhoneExist = async (phoneNumber: string) => {
//     const response = await api.get('/Auth/IsExist-PhoneNumber', {
//         params: { phoneNumber },
//     })
//     return response.data
// }

// /**
//  * 📝 تکمیل نهایی ثبت‌نام و ایجاد کاربر جدید.
//  */
// export async function completeRegistration(payload: CompleteRegistrationRequest): Promise<CompleteRegistrationResponse> {
//     const { data } = await api.post<CompleteRegistrationResponse>('Auth/register-user', payload)
//     return data
// }

// /**
//  * 🔐 ورود کاربر و دریافت توکن JWT
//  */
// export async function loginUser(payload: LoginRequest): Promise<AuthResult> {
//     const { data } = await api.post<AuthResult>('Auth/login', payload)
//     return data
// }

// export async function refreshToken(payload: RefreshTokenRequest): Promise<AuthResult> {
//     const { data } = await api.post<AuthResult>('Auth/refresh-token', payload)
//     return data
// }

// export async function revokeToken(payload: RevokeTokenRequest): Promise<boolean> {
//     const { data } = await api.post<boolean>('Auth/revoke', payload)
//     return data
// }

// export async function getCurrentUser(): Promise<UserInfoModel> {
//     const { data } = await api.get<UserInfoModel>('Auth/current')
//     return data
// }

