// 📁 مسیر: src/pages/Login.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box,
    Button,
    TextField,
    Typography,
    IconButton,
    InputAdornment,
} from '@mui/material'
import { Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material'
import { toast } from 'react-toastify'
import { useApiMutation } from '@/hooks/useApiMutation'
import api, { type ApiResponse } from '@/api/apiService'

interface LoginModel {
    phoneNumber: string
    password: string
}

interface UserInfoModel {
    id: string
    phoneNumber: string
    fullName: string
    roles: string[]
}

interface AuthResult {
    accessToken: string
    refreshToken: string
    expiresAt: string
    sessionId?: string
    userInfo: UserInfoModel
}

/**
 * ✅ صفحه ورود کاربر
 * هماهنگ با ساختار مرکزی Toast و apiService
 * از طرق متد POST → api/Auth/login
 */
export default function Login() {
    const navigate = useNavigate()
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const { mutate, isLoading } = useApiMutation<LoginModel, ApiResponse<AuthResult>>(
        async payload => {
            const { data } = await api.post<ApiResponse<AuthResult>>('Auth/login', payload)
            return data
        },
        {
            onSuccess: res => {
                if (res.success && res.data) {
                    const { accessToken, refreshToken, expiresAt, userInfo } = res.data
                    localStorage.setItem('accessToken', accessToken)
                    localStorage.setItem('refreshToken', refreshToken)
                    localStorage.setItem('expiresAt', expiresAt)
                    localStorage.setItem('user', JSON.stringify(userInfo))
                    toast.success(res.message || 'ورود با موفقیت انجام شد ✅', { rtl: true })
                    navigate('/', { replace: true })
                } else {
                    toast.error(res.message || 'نام کاربری یا رمز عبور اشتباه است ❌', { rtl: true })
                }
            },
            onError: err => {
                const msg =
                    err instanceof Error && err.message
                        ? err.message
                        : 'خطا در ورود به سیستم.'
                toast.error(msg, { rtl: true })
            },
        }
    )

    const validateForm = (): boolean => {
        if (!/^09\d{9}$/.test(phone)) {
            toast.warn('شماره موبایل معتبر نیست.', { rtl: true })
            return false
        }
        if (!password || password.length < 6) {
            toast.warn('رمز عبور باید حداقل ۶ کاراکتر باشد.', { rtl: true })
            return false
        }
        return true
    }

    const handleSubmit = () => {
        if (!validateForm()) return
        mutate({ phoneNumber: phone, password })
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
            <Typography variant="h6" textAlign="center" sx={{ mb: 2 }}>
                ورود به حساب کاربری
            </Typography>

            <TextField
                label="شماره موبایل"
                value={phone}
                onChange={e => setPhone(e.target.value.trim())}
                inputProps={{
                    dir: 'ltr',
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                    maxLength: 11,
                }}
                fullWidth
            />

            <TextField
                label="رمز عبور"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                fullWidth
                inputProps={{ dir: 'ltr' }}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />

            <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleSubmit}
                disabled={isLoading}
                startIcon={<LoginIcon sx={{ ml: 1 }} />}
                sx={{ mt: 2 }}
            >
                {isLoading ? 'در حال ورود...' : 'ورود'}
            </Button>

            <Button
                variant="text"
                color="secondary"
                sx={{ mt: 1 }}
                onClick={() => navigate('/send-otp')}
            >
                ثبت‌نام کاربر جدید
            </Button>
        </Box>
    )
}
