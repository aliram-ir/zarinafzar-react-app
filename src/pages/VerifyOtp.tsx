// 📁 مسیر: src/pages/VerifyOtp.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, TextField, Typography } from '@mui/material'
import { toast } from 'react-toastify'
import { verifyOtp } from '@/api/services/authService'
import type { VerifyOtpRequest, VerifyOtpResponse } from '@/types/auth'
import { getOtpSession, setOtpVerified, clearOtpSession } from '@/utils/otpSession'
import { useApiMutation } from '@/hooks/useApiMutation'

/**
 * 💡 صفحه‌ی تأیید شماره موبایل (OTP)
 * کنترل تایمر، Toast و هدایت امن به صفحه ثبت‌نام نهایی
 */
export default function VerifyOtp() {
    const [otpCode, setOtpCode] = useState('')
    const [seconds, setSeconds] = useState(0)
    const navigate = useNavigate()
    const session = getOtpSession()

    // 🚀 فراخوانی API تأیید OTP با Typeهای نوع‌دار
    const { mutate, isLoading } = useApiMutation<VerifyOtpRequest, VerifyOtpResponse>(verifyOtp, {
        onSuccess: res => {
            if (res.success && res.data === true) {
                setOtpVerified()
                toast.success('✅ کد با موفقیت تأیید شد', { rtl: true })
                navigate('/complete-registration')
            } else {
                toast.error(res.message ?? 'کد وارد شده صحیح نیست', { rtl: true })
            }
        },
        onError: err => {
            const msg =
                err instanceof Error && err.message
                    ? err.message
                    : 'خطا در ارتباط با سرور'
            toast.error(msg, { rtl: true })
        },
    })

    /* ---------------------------------------------------------------------- */
    /* ⏱️ کنترل سشن و تایمر انقضای OTP                                      */
    /* ---------------------------------------------------------------------- */
    useEffect(() => {
        if (!session) {
            navigate('/send-otp')
            return
        }

        // اگر سشن منقضی شده و هنوز تأیید نشده است
        if (session.isExpired) {
            toast.info('⏰ زمان وارد کردن کد منقضی شده است.', { rtl: true })
            clearOtpSession()
            navigate('/send-otp')
            return
        }

        // ⏲️ محاسبه باقیمانده‌ی زمان فقط زمانی که تأیید نشده است
        if (!session.verified) {
            const interval = setInterval(() => {
                const remaining = session.expireAt - Date.now()
                if (remaining <= 0) {
                    toast.info('زمان کد به پایان رسید ⏰', { rtl: true })
                    clearOtpSession()
                    navigate('/send-otp')
                    clearInterval(interval)
                } else {
                    setSeconds(Math.floor(remaining / 1000))
                }
            }, 1000)

            return () => clearInterval(interval)
        }
    }, [navigate, session])

    /* ---------------------------------------------------------------------- */
    /* 🧭 ارسال فرم تأیید                                                   */
    /* ---------------------------------------------------------------------- */
    const handleSubmit = () => {
        if (!/^\d{4,6}$/.test(otpCode)) {
            toast.error('کد باید عددی ۴ تا ۶ رقمی باشد', { rtl: true })
            return
        }

        if (!session) {
            toast.error('❌ سشن نامعتبر است', { rtl: true })
            navigate('/send-otp')
            return
        }

        mutate({ phoneNumber: session.phone, otpCode })
    }

    // 🧩 در صورت نبود سشن، از رندر صفحه جلوگیری کن
    if (!session) return null

    /* ---------------------------------------------------------------------- */
    /* 🎨 UI صفحه تأیید OTP                                                 */
    /* ---------------------------------------------------------------------- */
    return (
        <Box
            sx={{
                p: 4,
                maxWidth: 400,
                mx: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
            }}
        >
            <Typography variant="h6" textAlign="center">
                تأیید شماره: {session.phone}
            </Typography>

            <TextField
                label="کد تأیید"
                value={otpCode}
                onChange={e => setOtpCode(e.target.value)}
                fullWidth
                slotProps={{
                    input: {
                        dir: 'ltr',
                        inputProps: {
                            inputMode: 'numeric',
                            maxLength: 6,
                        },
                    },
                }}
            />

            <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={isLoading}
            >
                {isLoading ? 'در حال بررسی...' : 'تأیید'}
            </Button>

            {!session.verified && (
                <Typography
                    align="center"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                >
                    ⏳ اعتبار کد: {Math.floor(seconds / 60)}:
                    {('0' + (seconds % 60)).slice(-2)}
                </Typography>
            )}
        </Box>
    )
}
