// 📁 src/providers/ThemeModeProvider.tsx
import React from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { useThemeMode, ThemeModeContext } from '@/hooks/useThemeMode'

/**
 * Provider تم
 */
export const ThemeModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const value = useThemeMode()

    return (
        <ThemeModeContext.Provider value={value}>
            <ThemeProvider theme={value.theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeModeContext.Provider>
    )
}
