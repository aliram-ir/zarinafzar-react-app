// 📁 مسیر فایل: src/layout/MainLayout.tsx
// 📌 افزودن Theme Toggle و استفاده از هوک useThemeContext
import { Outlet, Link, useLocation } from 'react-router-dom'
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Button,
    IconButton, // 🆕 برای دکمه آیکونی
    Tooltip,    // 🆕 برای نمایش توضیحات روی دکمه
    useTheme    // 🆕 برای دسترسی به شیء تم در صورت نیاز
} from '@mui/material'
import Brightness4Icon from '@mui/icons-material/Brightness4' // 🌙 آیکون تم تاریک
import Brightness7Icon from '@mui/icons-material/Brightness7' // ☀️ آیکون تم روشن

// 🪝 هوک حیاتی برای مدیریت وضعیت تم
import { useThemeContext } from '@/hooks/useThemeMode'

export default function MainLayout() {
    const location = useLocation()
    const { mode, toggleTheme } = useThemeContext() // 🔑 دسترسی به وضعیت و تابع تغییر تم
    const theme = useTheme() // 🎨 اگر نیاز به دسترسی مستقیم به پالت تم داشتید

    // ⚠️ توجه: مسیر /usersList در کدهای قبلی شما بود، اما در این کد به /users تغییر کرد.
    // من از ورژن جدید یعنی /users استفاده می‌کنم.
    const links = [
        { to: '/', label: 'خانه' },
        { to: '/usersList', label: 'کاربران' },
        { to: '/products', label: 'محصولات' },
        { to: '/settings', label: 'تنظیمات' },
    ]

    return (
        <Box
            sx={{
                height: '100vh',
                // 🎨 استفاده از رنگ‌های تم MUI به جای کد هاردکد
                bgcolor: theme.palette.background.default,
                direction: 'rtl'
            }}
        >
            <AppBar position="static" color="primary">
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>

                    {/* 📚 سمت راست: عنوان برنامه */}
                    <Typography
                        variant="h6"
                        sx={{ fontFamily: 'Vazirmatn' }}
                    >
                        زرین‌افزار
                    </Typography>

                    {/* 🔗 وسط: لینک‌های ناوبری */}
                    <Box sx={{ flexGrow: 1, textAlign: 'center' }}>
                        {links.map(link => (
                            <Button
                                key={link.to}
                                // 💡 اگر در حالت Dark بودیم، باید رنگ Secondary را تنظیم کنیم.
                                // در حالت Dark، 'inherit' بهتر دیده می‌شود.
                                color={location.pathname === link.to ? 'secondary' : 'inherit'}
                                component={Link}
                                to={link.to}
                                sx={{
                                    fontFamily: 'Vazirmatn',
                                    mx: 1
                                }}
                            >
                                {link.label}
                            </Button>
                        ))}
                    </Box>

                    {/* 🌓 سمت چپ: دکمه‌ی تغییر تم */}
                    <Tooltip title={`تغییر به تم ${mode === 'dark' ? 'روشن' : 'تاریک'}`}>
                        <IconButton
                            onClick={toggleTheme} // 🎯 فراخوانی تابع جابجایی
                            color="inherit" // 🎨 رنگ آیکون با رنگ AppBar هماهنگ می‌شود
                        >
                            {/* 🌙 نمایش آیکون مناسب بر اساس حالت فعلی */}
                            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                        </IconButton>
                    </Tooltip>

                </Toolbar>
            </AppBar>

            <Box sx={{ p: 3 }}>
                <Outlet />
            </Box>
        </Box>
    )
}
