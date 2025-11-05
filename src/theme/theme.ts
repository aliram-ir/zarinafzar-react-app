// theme.ts
import { createTheme } from '@mui/material/styles';

// ساخت تم سفارشی با رنگ‌های گوگل و رنگ اصلی شما
const theme = createTheme({
    palette: {
        primary: {
            main: '#FBBC05', // رنگ اصلی (زرد گوگل)
            contrastText: '#000000', // متن روی دکمه‌ها
        },
        secondary: {
            main: '#FFCB05', // رنگ ثانویه
            contrastText: '#000000',
        },
        error: {
            main: '#EA4335', // قرمز گوگل
            contrastText: '#ffffff',
        },
        success: {
            main: '#34A853', // سبز گوگل
            contrastText: '#ffffff',
        },
        warning: {
            main: '#FBBC05', // زرد گوگل
            contrastText: '#000000',
        },
        info: {
            main: '#4285F4', // آبی گوگل
            contrastText: '#ffffff',
        },
        background: {
            default: '#ffffff', // پس‌زمینه سفید
            paper: '#f5f5f5', // پس‌زمینه کارت‌ها
        },
        text: {
            primary: '#202124',
            secondary: '#5f6368',
        },
    },
    typography: {
        fontFamily: 'Vazirmatn, Arial, sans-serif',
        h1: { fontSize: '2rem', fontWeight: 700 },
        h2: { fontSize: '1.75rem', fontWeight: 700 },
        h3: { fontSize: '1.5rem', fontWeight: 700 },
        h4: { fontSize: '1.25rem', fontWeight: 700 },
        h5: { fontSize: '1rem', fontWeight: 700 },
        h6: { fontSize: '0.875rem', fontWeight: 700 },
        button: { textTransform: 'none' }, // دکمه‌ها بدون حروف بزرگ
    },
    components: {
        MuiButton: {
            defaultProps: {
                variant: 'contained', // پیشفرض تمام دکمه‌ها
            },
            styleOverrides: {
                root: {
                    borderRadius: 8, // گرد بودن گوشه‌ها
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 12, // گرد بودن کارت‌ها
                },
            },
        },
    },
});

export default theme;
