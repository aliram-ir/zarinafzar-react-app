import { useEffect, useRef, useState, useCallback } from 'react'
import { toast } from 'react-toastify'
import * as apiHelper from '../api/apiHelper'

/**
 * وضعیت داده‌ای که از API دریافت می‌کنیم
 */
interface ApiState<T> {
    data: T | null
    isLoading: boolean
    error: string | null
}

/**
 * پارامترهای تنظیمی قابل انتخاب برای useApi
 */
interface UseApiOptions {
    /** بعد از mount به صورت خودکار فراخوانی شود؟ (پیش‌فرض: true) */
    immediate?: boolean
    /** بازخوانی خودکار هنگام focus مجدد صفحه (پیش‌فرض: true) */
    refetchOnWindowFocus?: boolean
    /** تعداد دفعات retry در صورت خطا (پیش‌فرض: 1) */
    retryCount?: number
}

/**
 * قلاب اصلی برای مدیریت درخواست‌های API با Type Safety کامل
 */
export function useApi<T>(
    endpoint: string,
    options: UseApiOptions = {}
) {
    const {
        immediate = true,
        refetchOnWindowFocus = true,
        retryCount = 1
    } = options

    const [state, setState] = useState<ApiState<T>>({
        data: null,
        isLoading: false,
        error: null
    })

    // ذخیره‌ی مقدار قبلی برای تشخیص refetch‌ها
    const cacheRef = useRef<T | null>(null)
    const retryRef = useRef(0)

    const fetchData = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }))

        try {
            const result = await apiHelper.getResult<T>(endpoint)
            cacheRef.current = result
            setState({ data: result, isLoading: false, error: null })
        } catch (err: unknown) {
            let message = 'خطا در ارتباط با سرور'

            if (err instanceof Error) {
                message = err.message
            } else if (typeof err === 'string') {
                message = err
            }

            toast.error(message)

            if (retryRef.current < retryCount) {
                retryRef.current++
                setTimeout(fetchData, 1000) // retry بعد از ۱ ثانیه
                return
            }

            setState(prev => ({ ...prev, isLoading: false, error: message }))
        } finally {
            retryRef.current = 0
        }

    }, [endpoint, retryCount])

    const refetch = useCallback(() => {
        fetchData()
    }, [fetchData])

    // اجرای اولیه
    useEffect(() => {
        if (immediate) fetchData()
    }, [immediate, fetchData])

    // بازخوانی هنگام فوکوس مجدد (مثل React Query)
    useEffect(() => {
        if (!refetchOnWindowFocus) return
        const handleFocus = () => refetch()
        window.addEventListener('focus', handleFocus)
        return () => window.removeEventListener('focus', handleFocus)
    }, [refetchOnWindowFocus, refetch])

    return {
        ...state,
        refetch,
        isEmpty: !state.isLoading && !state.data
    }
}
