import { useState, useMemo, useCallback, createContext, useContext, useEffect } from 'react'
import {
    createTheme,
    type Theme, // 🔑 اصلاح Type Safety: استفاده از type-only import
    type PaletteMode // 🔑 اصلاح Type Safety: استفاده از type-only import
} from '@mui/material'

// 🔑 کلید localStorage برای ذخیره حالت تم
const THEME_STORAGE_KEY = 'app-theme-mode'

/**
 * 🛠️ ساختار بازگشتی هوک و Context.
 */
interface ThemeModeContextType {
    mode: PaletteMode // 'light' یا 'dark'
    toggleTheme: () => void // تابعی برای تغییر تم
    theme: Theme // شیء تم MUI که شامل پالت، تایپوگرافی و ... است
}

// 📌 ایجاد Context برای اشتراک‌گذاری وضعیت تم
export const ThemeModeContext = createContext<ThemeModeContextType | undefined>(undefined)

/**
 * 🪝 هوک اصلی مدیریت تم.
 * وظایف: ۱. بازیابی وضعیت از localStorage. ۲. مدیریت تغییر وضعیت. ۳. ساخت شیء تم MUI.
 * @returns {ThemeModeContextType}
 */
export const useThemeMode = (): ThemeModeContextType => {

    // 💡 بازیابی وضعیت اولیه از localStorage یا پیش‌فرض 'light'
    const getInitialMode = (): PaletteMode => {
        if (typeof window !== 'undefined') {
            const savedMode = localStorage.getItem(THEME_STORAGE_KEY)
            return (savedMode as PaletteMode) || 'light'
        }
        return 'light'
    }

    const [mode, setMode] = useState<PaletteMode>(getInitialMode)

    // 🔄 تابع تغییر حالت تم: 'light' به 'dark' و بالعکس
    const toggleTheme = useCallback(() => {
        setMode(prevMode => {
            const newMode = prevMode === 'light' ? 'dark' : 'light'
            // 💾 ذخیره وضعیت جدید در localStorage
            localStorage.setItem(THEME_STORAGE_KEY, newMode)
            return newMode
        })
    }, [])

    // 💡 افکت برای اطمینان از اعمال تم ذخیره شده هنگام بارگذاری اولیه
    // ⚠️ نکته فنی: در حالت SSR یا بارگذاری اولیه سمت سرور، ممکن است خطا دهد.
    // اما برای حالت Client-Side Rendering فعلی شما، این کار تضمین می‌کند که حالت ذخیره شده بلافاصله اعمال شود.
    useEffect(() => {
        setMode(getInitialMode())
    }, [])

    // 🎨 ساخت شیء تم MUI بر اساس حالت فعلی (mode)
    const theme = useMemo<Theme>(() => {
        // 🔑 لیست فونت‌ها را به صورت آرایه تعریف می‌کنیم و در نهایت با join به رشته تبدیل می‌کنیم.
        // این کار بهترین شیوه‌ی MUI برای تعریف font-family است.
        const FONT_FAMILY = ['Vazirmatn', 'Arial', 'sans-serif'].join(',')

        return createTheme({
            direction: 'rtl', // ⬅️ حفظ جهت‌دهی راست به چپ (RTL) در تم
            typography: {
                // ✅ اصلاح حیاتی: تزریق صحیح font-family به ساختار تم MUI
                fontFamily: FONT_FAMILY,
            },
            palette: {
                mode, // تزریق حالت 'light' یا 'dark' به پالت
                // 🎨 تعریف رنگ‌های اصلی ما (می‌تواند گسترش یابد)
                primary: {
                    main: mode === 'dark' ? '#90caf9' : '#1976d2',
                },
                secondary: {
                    main: mode === 'dark' ? '#f48fb1' : '#dc004e',
                },
                // 🖌️ سفارشی‌سازی پس‌زمینه برای تم تاریک
                ...(mode === 'dark' && {
                    background: {
                        default: '#121212', // رنگ پس‌زمینه‌ی استاندارد
                        paper: '#1d1d1d', // رنگ پس‌زمینه‌ی کارت‌ها و سطوح
                    },
                }),
            },
            // 📝 سفارشی‌سازی کامپوننت‌ها (مثال: تنظیم Typography برای اعمال فونت)
            components: {
                MuiCssBaseline: {
                    styleOverrides: {
                        body: {
                            // 💡 تضمین اعمال فونت بر روی body در کنار direction: 'rtl'
                            fontFamily: FONT_FAMILY,
                        },
                    },
                },
            }
        })
    }, [mode])

    return { mode, toggleTheme, theme }
}

/**
 * 🪝 هوک کمکی برای استفاده آسان از Context در کامپوننت‌ها
 * @returns {ThemeModeContextType}
 */
export const useThemeContext = (): ThemeModeContextType => {
    const context = useContext(ThemeModeContext)
    if (context === undefined) {
        throw new Error('useThemeContext must be used within a ThemeModeProvider')
    }
    return context
}
