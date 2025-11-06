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
 * 🧩 صفحه‌ی تکمیل ثبت‌نام — فقط کنترل داده و اعتبارسنجی محلی
 * ✅ همه پیام‌های سرور از طریق useApiMutation مدیریت و نمایش داده می‌شوند.
 */
export default function CompleteRegistration() {
    const navigate = useNavigate()
    const session = getOtpSession()

    // 🧠 Stateها
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [nationalCode, setNationalCode] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    // ✨ Mutation (Toastها درون هوک مدیریت می‌شوند)
    const { mutate, isLoading } = useApiMutation<
        CompleteRegistrationRequest,
        CompleteRegistrationResponse
    >(completeRegistration, {
        onSuccess: res => {
            // ✅ فقط هدایت در صورت موفقیت واقعی
            if (res.success) {
                clearOtpSession()
                navigate('/')
            }
        },
    })

    /* ---------------------------------------------------------------------- */
    /* 🚦 بررسی سشن برای جلوگیری از ورود مستقیم بدون OTP                   */
    /* ---------------------------------------------------------------------- */
    useEffect(() => {
        if (!session?.verified) {
            navigate('/send-otp')
        }
    }, [navigate, session?.verified])

    /* ---------------------------------------------------------------------- */
    /* 🧭 اعتبارسنجی سمت کلاینت                                             */
    /* ---------------------------------------------------------------------- */
    const validateForm = (): boolean => {
        if (
            !firstName.trim() ||
            !lastName.trim() ||
            !nationalCode.trim() ||
            !email.trim() ||
            !password.trim() ||
            !confirmPassword.trim()
        ) {
            toast.warn('تمامی فیلدها الزامی هستند ⚠️', { rtl: true })
            return false
        }

        if (!/^\d{10}$/.test(nationalCode)) {
            toast.warn('کد ملی باید دقیقاً ۱۰ رقم باشد', { rtl: true })
            return false
        }

        if (password.length < 6) {
            toast.warn('رمز عبور باید حداقل ۶ کاراکتر باشد', { rtl: true })
            return false
        }

        if (password !== confirmPassword) {
            toast.warn('رمز و تکرار آن باید یکسان باشند', { rtl: true })
            return false
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.warn('فرمت ایمیل نامعتبر است', { rtl: true })
            return false
        }

        return true
    }

    /* ---------------------------------------------------------------------- */
    /* 🚀 ارسال داده‌ها به API                                              */
    /* ---------------------------------------------------------------------- */
    const handleSubmit = () => {
        if (!session?.phone) {
            toast.error('❌ سشن معتبر یافت نشد. لطفاً مجدداً احراز هویت کنید.', { rtl: true })
            navigate('/send-otp')
            return
        }

        if (!validateForm()) return

        const payload: CompleteRegistrationRequest = {
            phoneNumber: session.phone,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            nationalCode: nationalCode.trim(),
            email: email.trim(),
            password: password.trim(),
            confirmPassword: confirmPassword.trim(),
            createdAt: new Date().toISOString(),
            roleId: '00000000-0000-0000-0000-000000000000',
        }

        mutate(payload)
    }

    if (!session?.verified) return null

    /* ---------------------------------------------------------------------- */
    /* 🎨 رابط کاربری (UI)                                                 */
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
                inputProps={{ dir: 'ltr' }}
            />

            <TextField
                label="نام"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                inputProps={{ dir: 'rtl' }}
                fullWidth
            />

            <TextField
                label="نام خانوادگی"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                inputProps={{ dir: 'rtl' }}
                fullWidth
            />

            <TextField
                label="کد ملی"
                value={nationalCode}
                onChange={e => setNationalCode(e.target.value.replace(/\D/g, '').slice(0, 10))}
                inputProps={{ dir: 'ltr', inputMode: 'numeric', maxLength: 10 }}
                fullWidth
            />

            <TextField
                label="ایمیل"
                value={email}
                onChange={e => setEmail(e.target.value)}
                inputProps={{ dir: 'ltr' }}
                fullWidth
            />

            <TextField
                label="رمز عبور"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                inputProps={{ dir: 'ltr' }}
                fullWidth
            />

            <TextField
                label="تکرار رمز عبور"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                inputProps={{ dir: 'ltr' }}
                fullWidth
            />

            <Button
                fullWidth
                variant="contained"
                color="primary"
                disabled={isLoading}
                onClick={handleSubmit}
                sx={{ mt: 2 }}
            >
                {isLoading ? 'در حال ثبت...' : 'ثبت‌نام نهایی'}
            </Button>
        </Box>
    )
}
