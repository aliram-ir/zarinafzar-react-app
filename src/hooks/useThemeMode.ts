// 📁 src/hooks/useThemeMode.ts
import { useState, useMemo, useCallback, createContext, useContext, useEffect } from 'react'
import {
    createTheme,
    type Theme,
    type PaletteMode
} from '@mui/material'

// 🔑 کلید localStorage
const THEME_STORAGE_KEY = 'app-theme-mode'

/**
 * تایپ Context
 */
interface ThemeModeContextType {
    mode: PaletteMode
    toggleTheme: () => void
    theme: Theme
}

// 📌 Context
export const ThemeModeContext = createContext<ThemeModeContextType | undefined>(undefined)

/**
 * 🪝 هوک اصلی مدیریت تم
 */
export const useThemeMode = (): ThemeModeContextType => {

    // 💡 بازیابی وضعیت اولیه
    const getInitialMode = (): PaletteMode => {
        if (typeof window !== 'undefined') {
            const savedMode = localStorage.getItem(THEME_STORAGE_KEY)
            return (savedMode === 'dark' ? 'dark' : 'light') as PaletteMode
        }
        return 'light'
    }

    const [mode, setMode] = useState<PaletteMode>(getInitialMode)

    // 🔄 تابع تغییر تم
    const toggleTheme = useCallback(() => {
        setMode(prevMode => {
            const newMode: PaletteMode = prevMode === 'light' ? 'dark' : 'light'
            // 💾 ذخیره در localStorage
            localStorage.setItem(THEME_STORAGE_KEY, newMode)
            console.log('✅ Theme changed to:', newMode) // 👈 Debug
            return newMode
        })
    }, [])

    // 💡 افکت برای اعمال تم ذخیره شده
    useEffect(() => {
        const savedMode = getInitialMode()
        setMode(savedMode)
    }, [])

    // 🎨 ساخت شیء تم
    const theme = useMemo<Theme>(() => {
        const FONT_FAMILY = ['Vazirmatn', 'Arial', 'sans-serif'].join(',')

        console.log('🎨 Creating theme with mode:', mode) // 👈 Debug

        return createTheme({
            direction: 'rtl',
            typography: {
                fontFamily: FONT_FAMILY,
            },
            palette: {
                mode,
                primary: {
                    main: mode === 'dark' ? '#90caf9' : '#1976d2',
                },
                secondary: {
                    main: mode === 'dark' ? '#f48fb1' : '#dc004e',
                },
                ...(mode === 'dark' && {
                    background: {
                        default: '#121212',
                        paper: '#1d1d1d',
                    },
                }),
            },
            components: {
                MuiCssBaseline: {
                    styleOverrides: {
                        body: {
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
 * 🪝 هوک کمکی
 */
export const useThemeContext = (): ThemeModeContextType => {
    const context = useContext(ThemeModeContext)
    if (context === undefined) {
        throw new Error('useThemeContext must be used within a ThemeModeProvider')
    }
    return context
}
