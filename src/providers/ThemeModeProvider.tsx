// 📁 src/providers/ThemeModeProvider.tsx
import { ThemeProvider, CssBaseline } from '@mui/material'
import { ThemeModeContext, useThemeMode } from '@/hooks/useThemeMode'
import type { ReactNode } from 'react'

interface Props {
    children: ReactNode
}

/**
 * 🌗 تامین‌کننده‌ی حالت تم با پشتیبانی از تغییر وضعیت Light/Dark.
 * ⚙️ تمام زیرکامپوننت‌ها (از جمله صفحات OTP) به‌صورت خودکار تم، فونت و RTL را می‌بینند.
 */
export function ThemeModeProvider({ children }: Props) {
    const { mode, toggleTheme, theme } = useThemeMode()

    return (
        <ThemeModeContext.Provider value={{ mode, toggleTheme, theme }}>
            {/* 💡 ThemeProvider اصلی MUI */}
            <ThemeProvider theme={theme}>
                {/* 🧱 ریست و اعمال استایل پایه با فونت Vazirmatn */}
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeModeContext.Provider>
    )
}
