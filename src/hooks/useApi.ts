// 📁 مسیر فایل: src/hooks/useApi.ts
import { useEffect, useRef, useState, useCallback } from 'react'
import { toast } from 'react-toastify'
import * as apiHelper from '../api/apiHelper'
import type { ApiState } from '../types/apiState'
import { getCache, setCache } from '../utils/localStorageCache' // ✳️ ایمپورت توابع کمکی کش

interface UseApiOptions {
    immediate?: boolean
    refetchOnWindowFocus?: boolean
    cacheDurationMinutes?: number // ✳️ زمان انقضای کش
}

// 📌 هوک قدرتمند واکشی داده با قابلیت Cache و Offline-Friendly
export function useApi<T>(endpoint: string, options: UseApiOptions = {}) {
    const {
        immediate = true,
        refetchOnWindowFocus = true,
        cacheDurationMinutes = 5, // پیش‌فرض: ۵ دقیقه کش
    } = options

    const cacheKey = `api-cache-${endpoint}` // ✳️ کلید کش منحصر به فرد

    // ✳️ ۱. بارگذاری اولیه داده از کش (اگر وجود داشته باشد)
    const initialData = getCache<T>(cacheKey, cacheDurationMinutes)

    const [state, setState] = useState<ApiState<T>>({
        // اگر داده در کش بود، آن را به عنوان داده اولیه قرار بده
        data: initialData.data,
        isLoading: initialData.data ? false : true, // اگر داده‌ای در کش نیست، در حالت Loading شروع کن
        error: null,
    })

    const isFetchingRef = useRef(false) // برای جلوگیری از فراخوانی‌های همزمان

    const fetchData = useCallback(async () => {
        if (isFetchingRef.current) return
        isFetchingRef.current = true

        // 💡 اگر داده در کش موجود باشد، نیازی به نمایش لودینگ اولیه نیست
        if (!state.data) {
            setState(prev => ({ ...prev, isLoading: true, error: null }))
        }

        try {
            const result = await apiHelper.getResult<T>(endpoint)

            // ✳️ ۲. ذخیره داده‌ی موفق در کش
            setCache(cacheKey, result)

            // ✳️ ۳. به‌روزرسانی وضعیت با داده‌ی جدید
            setState({ data: result, isLoading: false, error: null })
        } catch (err: unknown) {
            let message = 'خطا در ارتباط با سرور'
            if (err instanceof Error) message = err.message
            else if (typeof err === 'string') message = err

            // ⚠️ اگر در حالت آفلاین هستیم و داده‌ای در کش داریم، فقط Toast خطا نمایش داده شود
            if (state.data) {
                toast.warning('⚠️ شبکه قطع است. داده‌های نمایش‌داده‌شده ممکن است قدیمی باشند.', { rtl: true })
                setState(prev => ({ ...prev, isLoading: false, error: message }))
            } else {
                // اگر هیچ داده‌ای (نه کش و نه جدید) نداریم، خطا نمایش داده شود
                toast.error(message, { rtl: true })
                setState({ data: null, isLoading: false, error: message })
            }
        } finally {
            isFetchingRef.current = false
        }
    }, [endpoint, cacheKey, state.data]) // وابستگی‌های به‌روزرسانی‌شده

    const refetch = useCallback(() => {
        fetchData()
    }, [fetchData])

    useEffect(() => {
        if (immediate) fetchData()
    }, [immediate, fetchData])

    useEffect(() => {
        if (!refetchOnWindowFocus) return
        const handleFocus = () => refetch()
        window.addEventListener('focus', handleFocus)
        return () => window.removeEventListener('focus', handleFocus)
    }, [refetchOnWindowFocus, refetch])

    return {
        ...state,
        refetch,
        isEmpty: !state.isLoading && !state.data,
    }
}
