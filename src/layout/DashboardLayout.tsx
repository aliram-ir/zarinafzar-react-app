// 📁 src/layout/DashboardLayout.tsx
import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Avatar,
    Menu,
    MenuItem,
    useMediaQuery,
    useTheme,
} from '@mui/material'
import {
    Menu as MenuIcon,
    ChevronRight as ChevronRightIcon,
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Settings as SettingsIcon,
    Brightness4 as DarkIcon,
    Brightness7 as LightIcon,
    AccountCircle,
    AdminPanelSettings as AdminPanelSettingsIcon,
} from '@mui/icons-material'
import { useThemeContext } from '@/hooks/useThemeMode'
import { useAuth } from '@/hooks/useAuth'


/**
 * 🎨 تنظیمات عرض Drawer
 */
const DRAWER_WIDTH = 240

/**
 * 📋 آیتم‌های منوی کناری
 */
const menuItems = [
    { text: 'داشبورد', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'لیست کاربران', icon: <PeopleIcon />, path: '/dashboard/users' },
    { text: 'تنظیمات', icon: <SettingsIcon />, path: '/dashboard/settings' },
    {
        text: 'مدیریت نقش‌ها',
        icon: <AdminPanelSettingsIcon />,
        path: '/dashboard/roles',
    },
]

/**
 * 🏗️ کامپوننت لایوت داشبورد
 */
const DashboardLayout: React.FC = () => {
    const theme = useTheme()
    const { mode, toggleTheme } = useThemeContext()
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    // 📱 تشخیص اندازه صفحه
    const isDesktop = useMediaQuery(theme.breakpoints.up('md')) // md = 900px به بالا

    // 📌 وضعیت باز/بسته بودن Drawer
    const [drawerOpen, setDrawerOpen] = useState(isDesktop)

    // 📌 وضعیت منوی کاربر
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

    /**
     * 🔄 تنظیم خودکار Drawer بر اساس اندازه صفحه
     */
    useEffect(() => {
        setDrawerOpen(isDesktop)
    }, [isDesktop])

    /**
     * تغییر وضعیت Drawer
     */
    const toggleDrawer = () => {
        setDrawerOpen(!drawerOpen)
    }

    /**
     * باز کردن منوی کاربر
     */
    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
    }

    /**
     * بستن منوی کاربر
     */
    const handleClose = () => {
        setAnchorEl(null)
    }

    /**
     * خروج از حساب
     */
    const handleLogout = async () => {
        handleClose()
        await logout()
        navigate('/login')
    }

    return (
        <Box sx={{ display: 'static', minHeight: '100vh' }}>
            {/* 🔝 AppBar بالای صفحه */}
            <AppBar
                position="fixed"
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
            >
                <Toolbar>
                    {/* دکمه باز/بسته کردن Drawer - سمت راست */}
                    <IconButton
                        color="inherit"
                        aria-label="toggle drawer"
                        onClick={toggleDrawer}
                        edge="end"
                        sx={{ mr: 2 }}
                    >
                        {drawerOpen ? <ChevronRightIcon /> : <MenuIcon />}
                    </IconButton>

                    {/* عنوان */}
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        پنل مدیریت زرین‌افزار
                    </Typography>

                    {/* نام کاربر */}
                    {user && (
                        <Typography variant="body2" sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
                            {user.fullName || user.phoneNumber}
                        </Typography>
                    )}

                    {/* دکمه تغییر تم */}
                    <IconButton color="inherit" onClick={toggleTheme}>
                        {mode === 'dark' ? <LightIcon /> : <DarkIcon />}
                    </IconButton>

                    {/* آیکون کاربر */}
                    <IconButton
                        size="large"
                        onClick={handleMenu}
                        color="inherit"
                    >
                        <AccountCircle />
                    </IconButton>

                    {/* منوی کاربر */}
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        sx={{ mt: 1 }}
                    >
                        <MenuItem onClick={() => {
                            handleClose()
                            navigate('/dashboard/profile')
                        }}>
                            پروفایل
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>
                            خروج
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            {/* 📄 محتوای اصلی */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    mt: 8, // فاصله از بالا برای AppBar
                    mr: {
                        xs: 0, // در موبایل بدون فاصله
                        md: drawerOpen ? `${DRAWER_WIDTH}px` : '60px' // در دسکتاپ با فاصله
                    },
                    transition: (theme) =>
                        theme.transitions.create('margin', {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                }}
            >
                <Outlet />
            </Box>

            {/* 📂 Drawer کناری - سمت راست */}
            <Drawer
                variant={isDesktop ? 'permanent' : 'temporary'} // 👈 در موبایل temporary
                anchor="right"
                open={drawerOpen}
                onClose={toggleDrawer} // 👈 برای بستن در حالت موبایل
                ModalProps={{
                    keepMounted: true, // بهبود عملکرد در موبایل
                }}
                sx={{
                    width: drawerOpen ? DRAWER_WIDTH : (isDesktop ? 60 : 0),
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                    boxSizing: 'border-box',
                    display: { xs: 'block', md: 'block' },
                    transition: (theme) =>
                        theme.transitions.create('width', {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                    '& .MuiDrawer-paper': {
                        width: drawerOpen ? DRAWER_WIDTH : (isDesktop ? 60 : 0),
                        transition: (theme) =>
                            theme.transitions.create('width', {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.enteringScreen,
                            }),
                        overflowX: 'hidden',
                    },
                }}
            >
                {/* فضای خالی برای AppBar */}
                <Toolbar />

                <Divider />

                {/* پروفایل کاربر در بالای Drawer */}
                {drawerOpen && (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Avatar
                            sx={{
                                width: 64,
                                height: 64,
                                mx: 'auto',
                                mb: 1,
                                bgcolor: 'primary.main',
                            }}
                        >
                            {user?.fullName?.charAt(0) || 'U'}
                        </Avatar>
                        <Typography variant="body2" noWrap>
                            {user?.fullName || 'کاربر'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                            {user?.phoneNumber}
                        </Typography>
                    </Box>
                )}

                <Divider />

                {/* لیست منوها */}
                <List>
                    {menuItems.map((item) => (
                        <ListItem key={item.text} disablePadding>
                            <ListItemButton
                                selected={location.pathname === item.path}
                                onClick={() => {
                                    navigate(item.path)
                                    // 👈 در موبایل بعد از کلیک، منو بسته بشه
                                    if (!isDesktop) {
                                        setDrawerOpen(false)
                                    }
                                }}
                                sx={{
                                    minHeight: 48,
                                    flexDirection: 'row-reverse', // 👈 راست‌چین کردن آیتم‌ها
                                    justifyContent: drawerOpen ? 'flex-start' : 'center',
                                    px: 2.5,
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: drawerOpen ? 3 : 'auto', // 👈 تغییر از ml به mr
                                        justifyContent: 'center',
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                {drawerOpen && (
                                    <ListItemText
                                        primary={item.text}
                                        sx={{
                                            textAlign: 'right', // 👈 متن راست‌چین
                                        }}
                                    />
                                )}
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Drawer>
        </Box>
    )
}

export default DashboardLayout
