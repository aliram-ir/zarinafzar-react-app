import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Box, Button, TextField, Typography } from '@mui/material'
import { useApiMutation } from '@/hooks/useApiMutation'
import { completeRegistration } from '@/api/services/authService'
import { getOtpSession, clearOtpSession } from '@/utils/otpSession'
import { toast } from 'react-toastify'

export default function CompleteRegistration() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()
    const session = getOtpSession()

    const { mutate, isLoading } = useApiMutation(completeRegistration, {
        onSuccess: () => {
            toast.success('ثبت‌نام با موفقیت انجام شد 🎉', { rtl: true })
            clearOtpSession()
            navigate('/')
        },
    })

    useEffect(() => {
        if (!session?.verified) {
            navigate('/send-otp')
        }
    }, [navigate, session?.verified])

    const handleSubmit = () => {
        mutate({ phoneNumber: session!.phone, fullName: name, email, password })
    }

    if (!session?.verified) return null

    return (
        <Box sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
            <Typography variant="h6" mb={2}>
                تکمیل ثبت‌نام
            </Typography>
            <TextField label="شماره موبایل" value={session.phone} fullWidth margin="normal" disabled />
            <TextField label="نام کامل" value={name} onChange={e => setName(e.target.value)} fullWidth margin="normal" />
            <TextField label="ایمیل" value={email} onChange={e => setEmail(e.target.value)} fullWidth margin="normal" />
            <TextField label="رمز عبور" type="password" value={password} onChange={e => setPassword(e.target.value)} fullWidth margin="normal" />
            <Button fullWidth variant="contained" sx={{ mt: 2 }} disabled={isLoading} onClick={handleSubmit}>
                ثبت‌نام نهایی
            </Button>
        </Box>
    )
}
