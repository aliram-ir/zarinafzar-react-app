// 📁 مسیر: src/pages/SendOtp.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, TextField, Typography } from '@mui/material'
import { toast } from 'react-toastify'
import { useApiMutation } from '@/hooks/useApiMutation'
import { sendOtp, type SendOtpRequest } from '@/api/services/authService'
import { getOtpSession, setOtpSession } from '@/utils/otpSession'
import { toastSoftWarn } from "@/components/toast";

export default function SendOtp() {
    const [phone, setPhone] = useState('')
    const navigate = useNavigate()

    // 🚀 فراخوانی API با هوک mutation سفارشی
    const { mutate, isLoading } = useApiMutation<SendOtpRequest, { success: boolean; message: string }>(
        sendOtp,
        {
            onSuccess: res => {
                if (res.success) {
                    setOtpSession(phone)
                    toast.success('کد تأیید ارسال شد', { rtl: true })
                    navigate('/verify-otp')
                } else {
                    toast.error(res.message ?? 'ارسال کد با خطا مواجه شد', { rtl: true })
                }
            },
            onError: () => {
                toast.error('امکان برقراری ارتباط با سرور وجود ندارد', { rtl: true })
            },
        }
    )

    // 🔍 اگر OTP معتبر در سشن وجود دارد، هدایت به verify
    useEffect(() => {
        const controller = new AbortController()
        const session = getOtpSession()
        if (session && !session.isExpired && !controller.signal.aborted) {
            navigate('/verify-otp')
        }
        return () => controller.abort()
    }, [navigate])

    // ✅ اعتبارسنجی و ارسال فرم
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
            <Typography variant="h6" sx={{ mb: 1 }}>
                ارسال کد تأیید
            </Typography>

            <TextField
                label="شماره موبایل"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                fullWidth
                inputProps={{
                    dir: 'ltr',
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                    maxLength: 11,
                }}
            />

            <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={isLoading}
            >
                {isLoading ? 'در حال ارسال...' : 'ارسال کد'}
            </Button>
        </Box>
    )
}
