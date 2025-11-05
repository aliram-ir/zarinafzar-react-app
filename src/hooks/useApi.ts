// 📁 مسیر فایل: src/hooks/useApi.ts
import { useEffect, useRef, useState, useCallback } from 'react'
import { toast } from 'react-toastify'
import * as apiHelper from '../api/apiHelper'
import type { ApiState } from '../types/apiState'
import { getCache, setCache } from '../utils/localStorageCache'

interface UseApiOptions {
    immediate?: boolean
    refetchOnWindowFocus?: boolean
    cacheDurationMinutes?: number
}

// 📌 هوک واکشی Type-safe با پشتیبانی از کش و مدیریت خطا
export function useApi<T>(endpoint: string, options: UseApiOptions = {}) {
    const {
        immediate = true,
        refetchOnWindowFocus = true,
        cacheDurationMinutes = 5,
    } = options

    const cacheKey = `api-cache-${endpoint}`
    const initialData = getCache<T>(cacheKey, cacheDurationMinutes)

    const [state, setState] = useState<ApiState<T>>({
        data: initialData.data,
        isLoading: initialData.data ? false : true,
        error: null,
    })

    const isFetchingRef = useRef(false)

    const fetchData = useCallback(async () => {
        if (isFetchingRef.current) return
        isFetchingRef.current = true

        if (!state.data) {
            setState(prev => ({ ...prev, isLoading: true, error: null }))
        }

        try {
            const result = await apiHelper.getResult<T>(endpoint)
            setCache(cacheKey, result)
            setState({ data: result, isLoading: false, error: null })
        } catch (err: unknown) {
            let message = 'خطایی در انجام عملیات رخ داد.'
            if (err instanceof Error && err.message) message = err.message

            if (/Network|ارتباط|سرور/i.test(message)) {
                message = 'سرور در دسترس نیست.'
            }

            // اگر داده قبلاً در کش هست → نسخه آفلاین
            if (state.data) {
                toast.error('سرور امکان برقراری ارتباط با سرور وجود ندارد.', { rtl: true })
                setState(prev => ({ ...prev, isLoading: false, error: message }))
            } else {
                toast.error(message, { rtl: true })
                setState({ data: null, isLoading: false, error: message })
            }
        } finally {
            isFetchingRef.current = false
        }
    }, [endpoint, cacheKey, state.data])

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

    return { ...state, refetch, isEmpty: !state.isLoading && !state.data }
}
