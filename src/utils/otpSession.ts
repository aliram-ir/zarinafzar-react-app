// 📁 src/utils/otpSession.ts

/**
 * ساختار داده‌ی ذخیره‌شده برای OTP در localStorage
 */
export interface OtpSession {
    phone: string
    expireAt: number // زمان انقضا بر حسب میلی‌ثانیه (Date.now() + 3min)
    verified: boolean
}

/**
 * ⏳ ذخیره‌ی اطلاعات OTP در localStorage
 */
export function setOtpSession(phone: string): void {
    const expireAt = Date.now() + 3 * 60 * 1000 // ۳ دقیقه بعد
    const session: OtpSession = { phone, expireAt, verified: false }
    localStorage.setItem('otpSession', JSON.stringify(session))
}

/**
 * 📥 دریافت سشن OTP از localStorage
 * ⚙️ نکته: اگر OTP تایید شده باشد (verified=true)، انقضا نادیده گرفته می‌شود.
 */
export function getOtpSession(): (OtpSession & { isExpired: boolean }) | null {
    const data = localStorage.getItem('otpSession')
    if (!data) return null

    try {
        const session: OtpSession = JSON.parse(data)

        // ⚠️ اگر OTP تایید شده باشد، expireAt نادیده بگیر
        const isExpired = session.verified ? false : Date.now() > session.expireAt

        return { ...session, isExpired }
    } catch {
        localStorage.removeItem('otpSession') // در صورت خطای Parse
        return null
    }
}

/**
 * ✅ به‌روزرسانی وضعیت سشن به verified=true
 */
export function setOtpVerified(): void {
    const data = localStorage.getItem('otpSession')
    if (!data) return

    try {
        const session: OtpSession = JSON.parse(data)
        session.verified = true
        localStorage.setItem('otpSession', JSON.stringify(session))
    } catch {
        localStorage.removeItem('otpSession')
    }
}

/**
 * 🚮 حذف سشن OTP پس از ثبت‌نام نهایی
 */
export function clearOtpSession(): void {
    localStorage.removeItem('otpSession')
}
