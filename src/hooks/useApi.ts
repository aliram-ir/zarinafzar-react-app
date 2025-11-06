// 📁 src/hooks/useApi.ts
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

export function useApi<T>(endpoint: string, options: UseApiOptions = {}) {
    const {
        immediate = true,
        refetchOnWindowFocus = true,
        cacheDurationMinutes = 5,
    } = options

    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
    const cacheKey = `api-cache-${cleanEndpoint}`
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

        setState(prev => ({ ...prev, isLoading: true }))
        try {
            const result = await apiHelper.getResult<T>(cleanEndpoint)
            setCache(cacheKey, result)
            setState({ data: result, isLoading: false, error: null })
        } catch (err) {
            const message =
                err instanceof Error && err.message
                    ? err.message
                    : 'خطای ناشناخته رخ داد.'
            if (/Network|ارتباط|سرور/i.test(message))
                toast.error('اتصال به سرور برقرار نیست.', { rtl: true })
            else toast.error(message, { rtl: true })
            setState(prev => ({ ...prev, isLoading: false, error: message }))
        } finally {
            isFetchingRef.current = false
        }
    }, [cleanEndpoint, cacheKey])

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

    const isEmpty =
        !state.isLoading &&
        (!state.data ||
            (Array.isArray(state.data) && state.data.length === 0))

    return { ...state, refetch, isEmpty }
}

export default useApi
