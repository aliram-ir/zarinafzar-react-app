// 📁 src/pages/Panel/DashboardHome.tsx
import React from 'react'
import {
    Box,
    Typography,
    Paper,
    GridLegacy as Grid, // ✅ استفاده از GridLegacy با alias Grid
} from '@mui/material'
import {
    People as PeopleIcon,
    ShoppingCart as ShoppingCartIcon,
    AttachMoney as MoneyIcon,
    TrendingUp as TrendingUpIcon,
} from '@mui/icons-material'

/**
 * 📊 کامپوننت کارت آماری
 */
interface StatCardProps {
    title: string
    value: string | number
    icon: React.ReactNode
    color: string
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
    <Paper
        elevation={3}
        sx={{
            p: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            borderRight: `4px solid ${color}`,
        }}
    >
        <Box
            sx={{
                width: 60,
                height: 60,
                borderRadius: 2,
                bgcolor: `${color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color,
            }}
        >
            {icon}
        </Box>
        <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary">
                {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold">
                {value}
            </Typography>
        </Box>
    </Paper>
)

/**
 * 🏠 صفحه اصلی داشبورد
 */
const DashboardHome: React.FC = () => {
    // ✅ داده‌های فرضی برای نمایش
    const stats = [
        {
            title: 'کل کاربران',
            value: '1,234',
            icon: <PeopleIcon fontSize="large" />,
            color: '#1976d2',
        },
        {
            title: 'سفارشات امروز',
            value: '89',
            icon: <ShoppingCartIcon fontSize="large" />,
            color: '#2e7d32',
        },
        {
            title: 'درآمد ماه',
            value: '45M',
            icon: <MoneyIcon fontSize="large" />,
            color: '#ed6c02',
        },
        {
            title: 'رشد فروش',
            value: '+12%',
            icon: <TrendingUpIcon fontSize="large" />,
            color: '#9c27b0',
        },
    ]

    return (
        <Box>
            {/* 📌 هدر صفحه */}
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                داشبورد
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={4}>
                خوش آمدید! اینجا خلاصه‌ای از فعالیت‌های شماست.
            </Typography>

            {/* 📊 کارت‌های آماری */}
            <Grid container spacing={3} mb={4}>
                {stats.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <StatCard {...stat} />
                    </Grid>
                ))}
            </Grid>

            {/* 📈 بخش نمودارها */}
            <Grid container spacing={3}>
                {/* نمودار فروش */}
                <Grid item xs={12} md={8}>
                    <Paper elevation={3} sx={{ p: 3, height: 400 }}>
                        <Typography variant="h6" gutterBottom>
                            نمودار فروش ماهانه
                        </Typography>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '80%',
                                color: 'text.secondary',
                            }}
                        >
                            نمودار اینجا قرار می‌گیرد (Chart.js / Recharts)
                        </Box>
                    </Paper>
                </Grid>

                {/* آخرین فعالیت‌ها */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={3} sx={{ p: 3, height: 400 }}>
                        <Typography variant="h6" gutterBottom>
                            آخرین فعالیت‌ها
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            {[1, 2, 3, 4, 5].map((item) => (
                                <Box
                                    key={item}
                                    sx={{
                                        py: 1.5,
                                        borderBottom: '1px solid',
                                        borderColor: 'divider',
                                    }}
                                >
                                    <Typography variant="body2">
                                        فعالیت شماره {item}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        2 ساعت پیش
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    )
}

export default DashboardHome
