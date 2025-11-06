// 📁 src/pages/VerifyOtp.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, TextField, Typography } from '@mui/material'
import { toast } from 'react-toastify'
import { verifyOtp, type VerifyOtpRequest, type VerifyOtpResponse } from '@/api/services/authService'
import { getOtpSession, setOtpVerified, clearOtpSession } from '@/utils/otpSession'
import { useApiMutation } from '@/hooks/useApiMutation'

export default function VerifyOtp() {
    const [otpCode, setOtpCode] = useState('') // ⚙️ نام درست فیلد
    const [seconds, setSeconds] = useState(0)
    const navigate = useNavigate()
    const session = getOtpSession()

    const { mutate, isLoading } = useApiMutation<VerifyOtpRequest, VerifyOtpResponse>(verifyOtp, {
        onSuccess: res => {
            if (res.success && res.data === true) {
                setOtpVerified() // ☑️ ذخیره وضعیت verified در localStorage
                toast.success('تأیید موفق ✅', { rtl: true })
                navigate('/complete-registration')
            } else {
                toast.error(res.message ?? 'تأیید ناموفق بود', { rtl: true })
            }
        },
        onError: () => {
            toast.error('خطا در ارتباط با سرور', { rtl: true })
        },
    })

    // ⏳ بررسی وضعیت سشن و تایمر
    useEffect(() => {
        if (!session) {
            navigate('/send-otp')
            return
        }

        // اگر سشن از قبل منقضی است
        if (session.isExpired) {
            toast.info('⏰ زمان کد منقضی شده', { rtl: true })
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
            } else {
                setSeconds(Math.floor(remaining / 1000))
            }
        }, 1000)

        // پاکسازی دقیق تایمر
        return () => clearInterval(interval)
    }, [navigate, session])

    const handleSubmit = () => {
        if (!/^\d{4,6}$/.test(otpCode)) {
            toast.error('کد باید عددی ۴ تا ۶ رقمی باشد', { rtl: true })
            return
        }

        if (!session) {
            toast.error('سشن اعتبار ندارد', { rtl: true })
            navigate('/send-otp')
            return
        }

        mutate({ phoneNumber: session.phone, otpCode })
    }

    if (!session) return null

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

            <Typography align="center" color="text.secondary" mt={1}>
                اعتبار کد: {Math.floor(seconds / 60)}:
                {('0' + (seconds % 60)).slice(-2)}
            </Typography>
        </Box>
    )
}
