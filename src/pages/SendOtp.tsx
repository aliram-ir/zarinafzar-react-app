// 📁 مسیر: src/pages/SendOtp.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, TextField, Typography } from '@mui/material'
import { toast } from 'react-toastify'
import { useApiMutation } from '@/hooks/useApiMutation'
import { sendOtp } from '@/api/services/authService'
import type { SendOtpRequest, SendOtpResponse } from '@/types/auth'
import { getOtpSession, setOtpSession } from '@/utils/otpSession'
import { toastSoftWarn } from '@/components/toast'
import SendIcon from '@mui/icons-material/Send'

export default function SendOtp() {
    const [phone, setPhone] = useState('')
    const navigate = useNavigate()

    const { mutate, isLoading } = useApiMutation<SendOtpRequest, SendOtpResponse>(sendOtp, {
        onSuccess: res => {
            if (res.success) {
                setOtpSession(phone)
                toast.success('کد OTP ارسال شد.', { rtl: true }) // ✅ اصلاح شد
                navigate('/verify-otp')
            } else {
                toast.error(res.message ?? 'ارسال کد با خطا مواجه شد', { rtl: true })
            }
        },
        onError: () => {
            toast.error('خطا در ارتباط با سرور', { rtl: true })
        },
    })

    useEffect(() => {
        const controller = new AbortController()
        const session = getOtpSession()
        if (session && !session.isExpired && !controller.signal.aborted) {
            navigate('/verify-otp')
        }
        return () => controller.abort()
    }, [navigate])

    const handleSubmit = () => {
        if (!/^09\d{9}$/.test(phone)) {
            toastSoftWarn('شماره موبایل معتبر نیست')
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
                onChange={e => setPhone(e.target.value)}
                fullWidth
                slotProps={{
                    input: {
                        dir: 'ltr',
                        inputProps: { inputMode: 'numeric', maxLength: 11 },
                    },
                }}
            />

            <Button
                variant="text"
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
