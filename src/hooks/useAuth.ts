// 📁 src/hooks/useAuth.ts
import { useContext } from 'react'
import AuthContext from '@/contexts/AuthContext'

/**
 * هوک دسترسی به کانتکست احراز هویت
 */
export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth باید در داخل AuthProvider استفاده شود')
    }
    return context
}
