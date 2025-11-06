// 📁 مسیر: src/pages/CompleteRegistration.tsx
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Box, Button, TextField, Typography } from '@mui/material'
import { useApiMutation } from '@/hooks/useApiMutation'
import { completeRegistration } from '@/api/services/authService'
import type { CompleteRegistrationRequest, CompleteRegistrationResponse } from '@/types/auth'
import { getOtpSession, clearOtpSession } from '@/utils/otpSession'
import { toast } from 'react-toastify'

/**
 * 🧩 صفحه‌ی تکمیل ثبت‌نام با کنترل نوع داده، اعتبارسنجی سمت کلاینت
 * و مدیریت کامل پاسخ منطقی سرور (success=false).
 */
export default function CompleteRegistration() {
    const navigate = useNavigate()
    const session = getOtpSession()

    // 🎯 Stateهای مورد نیاز فرم
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [nationalCode, setNationalCode] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    // 🚀 Mutation برای ثبت‌نام نهایی
    const { mutate, isLoading } = useApiMutation<CompleteRegistrationRequest, CompleteRegistrationResponse>(
        completeRegistration,
        {
            onSuccess: res => {
                // ✅ فقط اگر عملیات واقعاً موفق بود
                if (res.success) {
                    toast.success(res.message || 'ثبت‌نام با موفقیت انجام شد', { rtl: true })
                    clearOtpSession()
                    navigate('/')
                } else {
                    // ❌ پاسخ منطقی ناموفق (مثلاً ایمیل تکراری)
                    toast.error(res.message || 'ثبت‌نام انجام نشد', { rtl: true })
                }
            },
            onError: err => {
                const msg = err instanceof Error ? err.message : 'خطا در ارتباط با سرور'
                toast.error(msg, { rtl: true })
            },
        }
    )

    /* ---------------------------------------------------------------------- */
    /* 🚦 بررسی سشن و جلوگیری از ورود غیرمجاز                               */
    /* ---------------------------------------------------------------------- */
    useEffect(() => {
        if (!session?.verified) {
            navigate('/send-otp')
        }
    }, [navigate, session?.verified])

    /* ---------------------------------------------------------------------- */
    /* 🧭 تابع اعتبارسنجی قبل از ارسال فرم                                  */
    /* ---------------------------------------------------------------------- */
    const validateForm = (): boolean => {
        if (!firstName.trim() || !lastName.trim() || !nationalCode.trim() ||
            !email.trim() || !password.trim() || !confirmPassword.trim()) {
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
            toast.error('رمز و تکرار آن باید یکسان باشند', { rtl: true })
            return false
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error('فرمت ایمیل معتبر نیست', { rtl: true })
            return false
        }

        return true
    }

    /* ---------------------------------------------------------------------- */
    /* 📤 ارسال فرم                                                          */
    /* ---------------------------------------------------------------------- */
    const handleSubmit = () => {
        if (!session?.phone) {
            toast.error('سشن معتبر یافت نشد یا به پایان رسیده', { rtl: true })
            navigate('/send-otp')
            return
        }

        if (!validateForm()) return

        const payload: CompleteRegistrationRequest = {
            phoneNumber: session.phone,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            confirmPassword: confirmPassword.trim(),
            createdAt: new Date().toISOString(),
            roleId: '00000000-0000-0000-0000-000000000000',
            nationalCode: nationalCode.trim(),
            email: email.trim(),
            password: password.trim(),
        }

        mutate(payload)
    }

    // 🛑 جلوگیری از رندر در صورت نبود سشن یا تأیید OTP
    if (!session?.verified) return null

    /* ---------------------------------------------------------------------- */
    /* 🎨 UI فرم تکمیل ثبت‌نام                                               */
    /* ---------------------------------------------------------------------- */
    return (
        <Box
            sx={{
                p: 4,
                maxWidth: 420,
                mx: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
            }}
        >
            <Typography variant="h6" textAlign="center" sx={{ mb: 2 }}>
                تکمیل ثبت‌نام
            </Typography>

            {/* شماره موبایل فقط خواندنی */}
            <TextField
                label="شماره موبایل"
                value={session.phone}
                fullWidth
                disabled
                margin="normal"
                inputProps={{ dir: 'ltr' }}
            />

            {/* نام و نام خانوادگی */}
            <TextField
                label="نام"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                fullWidth
                margin="normal"
                inputProps={{ dir: 'rtl' }}
            />

            <TextField
                label="نام خانوادگی"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                fullWidth
                margin="normal"
                inputProps={{ dir: 'rtl' }}
            />

            {/* کد ملی */}
            <TextField
                label="کد ملی"
                value={nationalCode}
                onChange={e => setNationalCode(e.target.value.replace(/\D/g, '').slice(0, 10))}
                fullWidth
                margin="normal"
                inputProps={{
                    dir: 'ltr',
                    inputMode: 'numeric',
                    maxLength: 10,
                }}
            />

            {/* ایمیل */}
            <TextField
                label="ایمیل"
                value={email}
                onChange={e => setEmail(e.target.value)}
                fullWidth
                margin="normal"
                inputProps={{ dir: 'ltr' }}
            />

            {/* رمز عبور */}
            <TextField
                label="رمز عبور"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                fullWidth
                margin="normal"
                inputProps={{ dir: 'ltr' }}
            />

            <TextField
                label="تکرار رمز عبور"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                fullWidth
                margin="normal"
                inputProps={{ dir: 'ltr' }}
            />

            {/* دکمه ثبت‌نام */}
            <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={isLoading}
                sx={{ mt: 2 }}
            >
                {isLoading ? 'در حال ثبت...' : 'ثبت‌نام نهایی'}
            </Button>
        </Box>
    )
}
