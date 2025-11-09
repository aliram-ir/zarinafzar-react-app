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
import { useThemeMode } from '@/hooks/useThemeMode'
import { useAuth } from '@/hooks/useAuth'


const MainLayout: React.FC = () => {
    const { mode, toggleTheme } = useThemeMode()
    const { user, isAuthenticated, logout } = useAuth()
    const navigate = useNavigate()

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const handleLogout = async () => {
        handleClose()
        await logout()
        navigate('/login')
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar position="sticky">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        پنل مدیریت
                    </Typography>

                    {/* نمایش نام کاربر اگر لاگین کرده */}
                    {isAuthenticated && user && (
                        <Typography variant="body2" sx={{ mr: 2 }}>
                            {user.fullName || user.phoneNumber}
                        </Typography>
                    )}

                    {/* دکمه تغییر تم */}
                    <IconButton color="inherit" onClick={toggleTheme}>
                        {mode === 'dark' ? <LightIcon /> : <DarkIcon />}
                    </IconButton>

                    {/* منوی کاربر */}
                    {isAuthenticated ? (
                        <>
                            <IconButton
                                size="large"
                                onClick={handleMenu}
                                color="inherit"
                            >
                                <AccountCircle />
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                }}
                            >
                                <MenuItem onClick={() => {
                                    handleClose()
                                    navigate('/usersList')
                                }}>
                                    لیست کاربران
                                </MenuItem>
                                <MenuItem onClick={handleLogout}>خروج</MenuItem>
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
            <Box component="main" sx={{ flexGrow: 1 }}>
                <Outlet />
            </Box>
        </Box>
    )
}

export default MainLayout
