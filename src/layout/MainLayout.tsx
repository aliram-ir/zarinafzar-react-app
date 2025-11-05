// src/layout/MainLayout.tsx
import { Outlet, Link, useLocation } from 'react-router-dom'
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material'

export default function MainLayout() {
    const location = useLocation()

    const links = [
        { to: '/', label: 'داشبورد' },
        { to: '/usersList', label: 'کاربران' },
        { to: '/products', label: 'محصولات' },
        { to: '/settings', label: 'تنظیمات' },
    ]

    return (
        <Box sx={{ height: '100vh', bgcolor: '#fafafa', direction: 'rtl' }}>
            <AppBar position="static" color="primary">
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" sx={{ fontFamily: 'Vazirmatn' }}>
                        زرین‌افزار
                    </Typography>
                    <Box>
                        {links.map(link => (
                            <Button
                                key={link.to}
                                color={location.pathname === link.to ? 'secondary' : 'inherit'}
                                component={Link}
                                to={link.to}
                                sx={{ fontFamily: 'Vazirmatn' }}
                            >
                                {link.label}
                            </Button>
                        ))}
                    </Box>
                </Toolbar>
            </AppBar>

            <Box sx={{ p: 3 }}>
                <Outlet />
            </Box>
        </Box>
    )
}
