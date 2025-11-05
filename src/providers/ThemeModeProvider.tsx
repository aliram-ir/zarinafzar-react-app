// 📁 مسیر فایل: src/providers/ThemeModeProvider.tsx
// Provider اصلی برای تزریق تم MUI و ThemeModeContext به برنامه.

import React from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { useThemeMode, ThemeModeContext } from '@/hooks/useThemeMode'


/**
 * 📌 کامپوننت ThemeModeProvider:
 * - استفاده از useThemeMode برای مدیریت وضعیت تم.
 * - فراهم کردن ThemeModeContext برای دسترسی به mode و toggleTheme در سراسر برنامه.
 * - استفاده از ThemeProvider MUI برای اعمال شیء تم (theme).
 * - استفاده از CssBaseline برای یکنواخت‌سازی CSS (Reset).
 */
export const ThemeModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    // 🪝 استفاده از هوک مدیریت تم
    const themeMode = useThemeMode()

    return (
        // 💡 Context برای دسترسی به توابع مدیریت تم (مثل toggleTheme)
        <ThemeModeContext.Provider value={themeMode}>
            {/* 🎨 ThemeProvider برای اعمال شیء تم MUI */}
            <ThemeProvider theme={themeMode.theme}>
                {/* 🔄 CssBaseline برای ریست کردن CSS مرورگر و اعمال رنگ پس‌زمینه‌ی تم */}
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeModeContext.Provider>
    )
}
