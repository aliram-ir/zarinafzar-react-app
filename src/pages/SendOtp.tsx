import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { Box, Button, TextField, Typography } from '@mui/material'
import { toast } from 'react-toastify'
import { useApiMutation } from '@/hooks/useApiMutation'
import { sendOtp } from '@/api/services/authService'
import type { SendOtpRequest, SendOtpResponse } from '@/types/auth'
import { getOtpSession, setOtpSession } from '@/utils/otpSession'
import SendIcon from '@mui/icons-material/Send'

export default function SendOtp() {
    const [phone, setPhone] = useState('')
    const navigate = useNavigate()
    // 🚀 فقط منطق API، Toast در خود useApiMutation انجام می‌شود
    const { mutate, isLoading } = useApiMutation<SendOtpRequest, SendOtpResponse>(
        sendOtp,
        {
            onSuccess: res => {
                if (res.success) {
                    // ✅ ذخیره session و هدایت
                    setOtpSession(phone)
                    navigate('/verify-otp')
                }
            },
        }
    )

    // 🔄 بررسی سشن فعال OTP (درصورت وجود هدایت به verify-otp)
    useEffect(() => {
        const controller = new AbortController()
        const session = getOtpSession()
        if (session && !session.isExpired && !controller.signal.aborted) {
            navigate('/verify-otp')
        }
        return () => controller.abort()
    }, [navigate])

    // 📤 ارسال کد OTP
    const handleSubmit = () => {
        if (!/^09\d{9}$/.test(phone)) {
            toast.warn('شماره موبایل معتبر نیست', { rtl: true })

            return
        }
        mutate({ phoneNumber: phone })
    }

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
            <Typography variant="h6" textAlign="center" sx={{ mb: 1 }}>
                ارسال کد تأیید
            </Typography>

            <TextField
                label="شماره موبایل"
                value={phone}
                onChange={e => setPhone(e.target.value.trim())}
                fullWidth
                inputProps={{
                    dir: 'ltr',
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                    maxLength: 11,
                }}
            />

            <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<SendIcon sx={{ ml: 1 }} />}
                onClick={handleSubmit}
                disabled={isLoading}
            >
                {isLoading ? 'در حال ارسال...' : 'ارسال کد'}
            </Button>
        </Box>
    )
}