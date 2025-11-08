// 📁 مسیر: src/pages/CompleteRegistration.tsx
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Box, Button, TextField, Typography } from '@mui/material'
import { useApiMutation } from '@/hooks/useApiMutation'
import { completeRegistration } from '@/api/services/authService'
import type {
    CompleteRegistrationRequest,
    CompleteRegistrationResponse,
} from '@/types/auth'
import { getOtpSession, clearOtpSession } from '@/utils/otpSession'
import { toast } from 'react-toastify'

/**
 * ✅ صفحه تکمیل ثبت‌نام:
 * - اگر بدون سشن معتبر وارد شد → هدایت به /send-otp
 * - در صورت موفقیت → هدایت به /login
 * - در صورت خطا → در همین صفحه بمان و Toast خطا نمایش بده
 */
export default function CompleteRegistration() {
    const navigate = useNavigate()
    const session = getOtpSession()

    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [nationalCode, setNationalCode] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const { mutate, isLoading } = useApiMutation<
        CompleteRegistrationRequest,
        CompleteRegistrationResponse
    >(completeRegistration, {
        onSuccess: res => {
            if (res.success) {
                clearOtpSession()
                toast.success(res.message || 'ثبت‌نام با موفقیت انجام شد ✅', { rtl: true })
                navigate('/login', { replace: true })
            } else {
                toast.error(res.message || 'ثبت‌نام ناموفق بود ❌', { rtl: true })
            }
        },
        onError: error => {
            const msg =
                error instanceof Error && error.message
                    ? error.message
                    : 'خطایی در ثبت‌نام رخ داد.'
            toast.error(msg, { rtl: true })
        },
    })

    // 🚦 بررسی سشن: اگر مستقیم وارد شد → به SendOtp هدایت شو
    useEffect(() => {
        if (!session?.verified) {
            navigate('/send-otp', { replace: true })
        }
    }, [navigate, session?.verified])

    // 🧭 اعتبارسنجی سمت کلاینت
    const validateForm = (): boolean => {
        if (!firstName || !lastName || !nationalCode || !email || !password || !confirmPassword) {
            toast.warn('تمامی فیلدها الزامی هستند ⚠️', { rtl: true })
            return false
        }

        if (!/^\d{10}$/.test(nationalCode)) {
            toast.warn('کد ملی باید دقیقاً ۱۰ رقم باشد.', { rtl: true })
            return false
        }

        if (password.length < 6) {
            toast.warn('رمز عبور باید حداقل ۶ کاراکتر باشد.', { rtl: true })
            return false
        }

        if (password !== confirmPassword) {
            toast.warn('رمز و تکرار آن باید یکسان باشند.', { rtl: true })
            return false
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            toast.warn('فرمت ایمیل نامعتبر است.', { rtl: true })
            return false
        }

        return true
    }

    // 🚀 ارسال به API
    const handleSubmit = async () => {
        if (!session?.phone) {
            toast.error('❌ سشن معتبر یافت نشد. لطفاً مجدداً احراز هویت کنید.', { rtl: true })
            navigate('/send-otp', { replace: true })
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

        try {
            await mutate(payload)
        } catch (err) {
            const msg =
                err instanceof Error && err.message
                    ? err.message
                    : 'خطایی در ارسال داده رخ داد.'
            toast.error(msg, { rtl: true })
        }
    }

    if (!session?.verified) return null

    // 🎨 رابط کاربری
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
                onChange={e =>
                    setNationalCode(e.target.value.replace(/\D/g, '').slice(0, 10))
                }
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
