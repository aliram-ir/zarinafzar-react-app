import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, TextField, Typography } from '@mui/material'
import { toast } from 'react-toastify'
import {
    verifyOtp,
    type VerifyOtpRequest,
    type VerifyOtpResponse,
} from '@/api/services/authService'
import {
    getOtpSession,
    setOtpVerified,
    clearOtpSession,
} from '@/utils/otpSession'
import { useApiMutation } from '@/hooks/useApiMutation'

/**
 * 💡 صفحه تأیید OTP با کنترل زمان و Toast کاملاً ایمن
 */
export default function VerifyOtp() {
    const [otpCode, setOtpCode] = useState('')
    const [seconds, setSeconds] = useState(0)
    const navigate = useNavigate()
    const session = getOtpSession()

    const { mutate, isLoading } = useApiMutation<VerifyOtpRequest, VerifyOtpResponse>(verifyOtp, {
        onSuccess: res => {
            // ✅ پاسخ منطقی از سرور (ساختار ApiResponse جدید)
            if (res.success && res.data === true) {
                setOtpVerified()
                toast.success('کد تأیید با موفقیت ثبت شد', { rtl: true })
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

        if (session.isExpired) {
            toast.info('⏰ زمان کد منقضی شده است.', { rtl: true })
            clearOtpSession()
            navigate('/send-otp')
            return
        }

        const interval = setInterval(() => {
            const remaining = session.expireAt - Date.now()
            if (remaining <= 0) {
                toast.info('زمان کد به پایان رسید', { rtl: true })
                clearOtpSession()
                navigate('/send-otp')
                clearInterval(interval)
            } else {
                setSeconds(Math.floor(remaining / 1000))
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [navigate, session])

    /* ---------------------------------------------------------------------- */
    /* 🧭 ارسال فرم تأیید                                                   */
    /* ---------------------------------------------------------------------- */
    const handleSubmit = () => {
        if (!/^\d{4,6}$/.test(otpCode)) {
            toast.error('کد باید عددی بین ۴ تا ۶ رقم باشد', { rtl: true })
            return
        }

        if (!session) {
            toast.error('سشن نامعتبر است', { rtl: true })
            navigate('/send-otp')
            return
        }

        mutate({ phoneNumber: session.phone, otpCode })
    }

    if (!session) return null

    /* ---------------------------------------------------------------------- */
    /* 🎨 UI فرم OTP                                                        */
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
                inputProps={{
                    dir: 'ltr',
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                    maxLength: 6,
                }}
            />

            <Button
                variant="contained"
                fullWidth
                onClick={handleSubmit}
                disabled={isLoading}
            >
                {isLoading ? 'در حال بررسی...' : 'تأیید'}
            </Button>

            <Typography align="center" color="text.secondary">
                اعتبار کد: {Math.floor(seconds / 60)}:
                {('0' + (seconds % 60)).slice(-2)}
            </Typography>
        </Box>
    )
}
