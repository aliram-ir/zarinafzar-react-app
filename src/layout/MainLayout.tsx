// 📁 src/layout/MainLayout.tsx
import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Box,
    Button,
    Menu,
    MenuItem,
} from '@mui/material'
import {
    Brightness4 as DarkIcon,
    Brightness7 as LightIcon,
    AccountCircle,
} from '@mui/icons-material'
import { useThemeContext } from '@/hooks/useThemeMode'
import { useAuth } from '@/hooks/useAuth'

const MainLayout: React.FC = () => {
    const { mode, toggleTheme } = useThemeContext()
    const { user, isAuthenticated, logout } = useAuth()
    const navigate = useNavigate()

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
        console.log('🔘 Menu opened') // 👈 Debug
    }

    const handleClose = () => {
        setAnchorEl(null)
        console.log('❌ Menu closed') // 👈 Debug
    }

    const handleLogout = async () => {
        handleClose()
        await logout()
        navigate('/login')
    }

    const handleThemeToggle = () => {
        console.log('🔘 Theme button clicked, current mode:', mode)
        toggleTheme()
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        پنل مدیریت زرین‌افزار
                    </Typography>

                    {/* نمایش نام کاربر */}
                    {isAuthenticated && user && (
                        <Typography variant="body2" sx={{ mr: 2 }}>
                            {user.fullName || user.phoneNumber}
                        </Typography>
                    )}

                    {/* دکمه تغییر تم */}
                    <IconButton color="inherit" onClick={handleThemeToggle}>
                        {mode === 'dark' ? <LightIcon /> : <DarkIcon />}
                    </IconButton>

                    {/* منوی کاربر */}
                    {isAuthenticated ? (
                        <>
                            <IconButton
                                size="large"
                                onClick={handleMenu}
                                color="inherit"
                                aria-label="account menu"
                                aria-controls="user-menu"
                                aria-haspopup="true"
                            >
                                <AccountCircle />
                            </IconButton>
                            <Menu
                                id="user-menu"
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right', // 👈 تغییر از left به right
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right', // 👈 اضافه شد
                                }}
                                sx={{
                                    mt: 1, // 👈 فاصله از بالا
                                }}
                            >
                                <MenuItem
                                    onClick={() => {
                                        handleClose()
                                        navigate('/usersList')
                                    }}
                                >
                                    لیست کاربران
                                </MenuItem>
                                <MenuItem onClick={handleLogout}>
                                    خروج
                                </MenuItem>
                            </Menu>
                        </>
                    ) : (
                        <Button color="inherit" onClick={() => navigate('/login')}>
                            ورود
                        </Button>
                    )}
                </Toolbar>
            </AppBar>

            {/* محتوای اصلی */}
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Outlet />
            </Box>
        </Box>
    )
}

export default MainLayout
