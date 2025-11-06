// 📁 مسیر: src/pages/CompleteRegistration.tsx
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Box, Button, TextField, Typography } from '@mui/material'
import { useApiMutation } from '@/hooks/useApiMutation'
import { completeRegistration } from '@/api/services/authService'
// 🎯 ایمپورت Typeهای صریح از فایل auth.ts
import type { CompleteRegistrationRequest, CompleteRegistrationResponse } from '@/types/auth'
import { getOtpSession, clearOtpSession } from '@/utils/otpSession'
import { toast } from 'react-toastify'

export default function CompleteRegistration() {
    // ⚙️ تعریف وضعیت‌های فرم
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [nationalCode, setNationalCode] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const navigate = useNavigate()
    const session = getOtpSession()

    // 🎯 فراخوانی API با هوک mutation Type-Safe
    const { mutate, isLoading } = useApiMutation<CompleteRegistrationRequest, CompleteRegistrationResponse>(
        completeRegistration,
        {
            onSuccess: res => {
                // 💡 مدیریت پاسخ موفقیت منطقی از سرور (کد 200 با IsSuccess: true/false)
                if (res.success) {
                    toast.success('ثبت‌نام با موفقیت انجام شد 🎉', { rtl: true })
                    clearOtpSession()
                    navigate('/')
                } else {
                    // نمایش خطای منطقی که در useApiMutation کنترل نشده است
                    toast.error(res.message ?? 'ثبت‌نام ناموفق بود', { rtl: true })
                }
            },
            // 🐛 رفع خطای 'unknown' و حذف Toast تکراری
            onError: (err) => {
                // Toast خطا توسط هوک useApiMutation نمایش داده شده است.
                const error = err as Error
                console.error('خطا در تکمیل ثبت‌نام:', error.message)
            },
        }
    )

    // 🚦 بررسی سشن: اگر تأیید نشده باشد، هدایت به صفحه ارسال OTP
    useEffect(() => {
        if (!session?.verified) navigate('/send-otp')
    }, [navigate, session?.verified])

    // 🧩 اعتبارسنجی سمت کلاینت
    const validateForm = (): boolean => {
        if (!firstName.trim() || !lastName.trim() || !nationalCode.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
            toast.error('تمامی فیلدها الزامی هستند', { rtl: true })
            return false
        }

        if (!/^\d{10}$/.test(nationalCode)) {
            toast.error('کد ملی باید ۱۰ رقم باشد', { rtl: true })
            return false
        }

        if (password.length < 6) {
            toast.error('رمز عبور باید حداقل ۶ کاراکتر باشد', { rtl: true })
            return false
        }

        if (password !== confirmPassword) {
            toast.error('رمز عبور و تکرار آن یکسان نیستند', { rtl: true })
            return false
        }

        // اعتبارسنجی ساده ایمیل
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error('فرمت ایمیل معتبر نیست', { rtl: true })
            return false
        }

        return true
    }

    // 🚀 ارسال فرم
    const handleSubmit = () => {
        if (!session?.phone) {
            toast.error('سشن معتبر یافت نشد', { rtl: true })
            navigate('/send-otp')
            return
        }

        if (!validateForm()) return

        // 🎯 ایجاد Payload Type-Safe با تطابق دقیق با DTO بک‌اند C#
        const payload: CompleteRegistrationRequest = {
            phoneNumber: session.phone,

            // 💡 فیلدهایی که بک‌اند انتظار دارد
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            confirmPassword: confirmPassword.trim(),

            // 💡 فیلدهای فنی که بک‌اند انتظار دارد، اما فرانت‌اند تنظیم می‌کند
            createdAt: new Date().toISOString(), // ارسال تاریخ جاری به فرمت ISO 8601
            roleId: null, // Guid? در C#، ارسال null

            // 💡 سایر فیلدها
            nationalCode: nationalCode.trim(),
            email: email.trim(),
            password: password.trim(),
        }

        mutate(payload)
    }

    // 🛑 جلوگیری از رندرینگ قبل از useEffect در صورت نبود سشن
    if (!session?.verified) return null

    // 🎨 رابط کاربری
    return (
        <Box sx={{ p: 4, maxWidth: 420, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" textAlign="center" sx={{ mb: 2 }}>
                تکمیل ثبت‌نام
            </Typography>

            <TextField label="شماره موبایل" value={session.phone} fullWidth margin="normal" disabled />
            <TextField label="نام" value={firstName} onChange={e => setFirstName(e.target.value)} fullWidth margin="normal" slotProps={{
                input: {
                    dir: 'rtl'
                }
            }} />
            <TextField label="نام خانوادگی" value={lastName} onChange={e => setLastName(e.target.value)} fullWidth margin="normal" slotProps={{
                input: {
                    dir: 'rtl'
                }
            }} />

            <TextField
                label="کد ملی"
                value={nationalCode}
                onChange={e => setNationalCode(e.target.value)}
                fullWidth
                margin="normal"
                inputProps={{ inputMode: 'numeric', maxLength: 10 }}
            />

            <TextField
                label="ایمیل"
                variant="outlined"
                value={email}
                onChange={e => setEmail(e.target.value)}
                fullWidth
                margin="normal"
                slotProps={{
                    input: {
                        dir: 'ltr'
                    }
                }}
            />

            <TextField
                label="رمز عبور"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                fullWidth
                margin="normal"
            />

            <TextField
                label="تکرار رمز عبور"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                fullWidth
                margin="normal"
            />

            <Button
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                disabled={isLoading}
                onClick={handleSubmit}
            >
                {isLoading ? 'در حال ثبت...' : 'ثبت‌نام نهایی'}
            </Button>
        </Box>
    )
}
