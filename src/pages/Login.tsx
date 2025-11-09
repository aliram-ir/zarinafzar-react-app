// 📁 src/pages/Login.tsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    CircularProgress,
} from '@mui/material'
import { login } from '@/api/services/authService'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-toastify'

const Login: React.FC = () => {
    const [phoneNumber, setPhoneNumber] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const { setUser, refreshAuth } = useAuth()
    const navigate = useNavigate()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!phoneNumber || !password) {
            toast.error('لطفاً تمام فیلدها را پر کنید', { rtl: true })
            return
        }

        setIsLoading(true)

        try {
            const result = await login(phoneNumber, password)

            if (result.success && result.data) {
                // ✅ ذخیره AccessToken
                localStorage.setItem('accessToken', result.data.accessToken)

                // ✅ ست کردن اطلاعات کاربر در Context
                setUser(result.data.userInfo)

                // ✅ بارگذاری مجدد اطلاعات
                await refreshAuth()

                toast.success('ورود موفقیت‌آمیز بود!', { rtl: true })
                navigate('/usersList')
            } else {
                toast.error(result.message || 'خطا در ورود', { rtl: true })
            }
        } catch (error) {
            console.error('خطا در ورود:', error)
            toast.error('خطا در برقراری ارتباط با سرور', { rtl: true })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '80vh',
                p: 2,
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    maxWidth: 400,
                    width: '100%',
                }}
            >
                <Typography variant="h5" component="h1" gutterBottom textAlign="center">
                    ورود به سیستم
                </Typography>

                <form onSubmit={handleLogin}>
                    <TextField
                        fullWidth
                        label="شماره تلفن"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        margin="normal"
                        dir="ltr"
                        disabled={isLoading}
                    />

                    <TextField
                        fullWidth
                        type="password"
                        label="رمز عبور"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        margin="normal"
                        disabled={isLoading}
                    />

                    <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        disabled={isLoading}
                        sx={{ mt: 3 }}
                    >
                        {isLoading ? <CircularProgress size={24} /> : 'ورود'}
                    </Button>

                    <Button
                        fullWidth
                        variant="text"
                        onClick={() => navigate('/send-otp')}
                        disabled={isLoading}
                        sx={{ mt: 2 }}
                    >
                        ثبت‌نام با OTP
                    </Button>
                </form>
            </Paper>
        </Box>
    )
}

export default Login
