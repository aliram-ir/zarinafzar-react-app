// 📁 src/pages/Login.tsx

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box,
    TextField,
    Button,
    Typography,
    CircularProgress,
} from '@mui/material'
import { login } from '@/api/services/authService'
import { useAuth } from '@/hooks/useAuth'

const Login: React.FC = () => {
    const navigate = useNavigate()
    const { setUser, refreshAuth } = useAuth()
    const [phoneNumber, setPhoneNumber] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const handleLogin = async () => {
        if (!phoneNumber || !password) {
            setError('لطفاً تمام فیلدها را پر کنید')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            console.log('🔐 Attempting login...')
            const result = await login(phoneNumber, password)

            console.log('✅ Login result received:', result)

            // ✅ چک کردن وجود result
            if (!result) {
                throw new Error('پاسخ سرور نامعتبر است')
            }

            // ✅ CRITICAL: ذخیره accessToken
            if (result.accessToken) {
                localStorage.setItem('accessToken', result.accessToken)
                console.log('💾 AccessToken saved:', result.accessToken.substring(0, 20) + '...')
            } else {
                throw new Error('توکن دسترسی دریافت نشد')
            }

            // ✅ ذخیره refreshToken اگر در حالت body باشیم
            if (result.refreshToken) {
                localStorage.setItem('refresh_token', result.refreshToken)
                console.log('💾 RefreshToken saved')
            }

            // ✅ بروزرسانی اطلاعات کاربر در Context
            if (result.userInfo) {
                setUser(result.userInfo)
                console.log('👤 User info set:', result.userInfo)
            }

            // ✅ رفرش احراز هویت
            await refreshAuth()

            console.log('🚀 Redirecting to dashboard...')
            navigate('/dashboard', { replace: true })

        } catch (err) {
            console.error('❌ Login error:', err)
            const errorMessage = err instanceof Error ? err.message : 'خطا در ورود'
            setError(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
            gap={2}
            p={3}
        >
            <Typography variant="h4">ورود</Typography>

            {error && (
                <Typography color="error" variant="body2">
                    {error}
                </Typography>
            )}

            <TextField
                label="شماره موبایل"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                fullWidth
                sx={{ maxWidth: 400 }}
                disabled={isLoading}
            />

            <TextField
                label="رمز عبور"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                sx={{ maxWidth: 400 }}
                disabled={isLoading}
            />

            <Button
                variant="contained"
                onClick={handleLogin}
                disabled={isLoading}
                fullWidth
                sx={{ maxWidth: 400 }}
            >
                {isLoading ? <CircularProgress size={24} /> : 'ورود'}
            </Button>

            <Button
                variant="text"
                onClick={() => navigate('/send-otp')}
                disabled={isLoading}
            >
                ورود با کد یکبار مصرف
            </Button>
        </Box>
    )
}

export default Login
