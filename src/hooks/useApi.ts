// 📁 مسیر: src/hooks/useApi.ts
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

/**
 * 🔁 هوک واکشی عمومی با پشتیبانی کش، Toast و Type‑Safety
 */
export function useApi<T>(endpoint: string, options: UseApiOptions = {}) {
    const {
        immediate = true,
        refetchOnWindowFocus = true,
        cacheDurationMinutes = 5,
    } = options

    const cacheKey = `api-cache-${endpoint}`
    const cachedData = getCache<T>(cacheKey, cacheDurationMinutes)

    const [state, setState] = useState<ApiState<T>>({
        data: cachedData.data,
        isLoading: !cachedData.data,
        error: null,
    })

    const isFetchingRef = useRef(false)

    const fetchData = useCallback(async () => {
        if (isFetchingRef.current) return
        isFetchingRef.current = true

        if (!state.data) setState(prev => ({ ...prev, isLoading: true }))

        try {
            const result = await apiHelper.getResult<T>(endpoint)
            setCache(cacheKey, result)
            setState({ data: result, isLoading: false, error: null })
        } catch (err) {
            const message =
                err instanceof Error && err.message
                    ? err.message
                    : 'خطایی در برقراری ارتباط رخ داد.'
            if (/Network|ارتباط|سرور/i.test(message))
                toast.error('سرور در دسترس نیست.', { rtl: true })
            else toast.error(message, { rtl: true })
            setState(prev => ({ ...prev, isLoading: false, error: message }))
        } finally {
            isFetchingRef.current = false
        }
    }, [endpoint, cacheKey, state.data])

    const refetch = useCallback(() => fetchData(), [fetchData])

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

export default useApi
