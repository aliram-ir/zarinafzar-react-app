// 📁 src/hooks/useApi.ts
import { useEffect, useRef, useState, useCallback } from 'react'
import * as apiHelper from '../api/apiHelper'
import type { ApiState } from '../types/apiState'
import { getCache, setCache } from '../utils/localStorageCache'

interface UseApiOptions {
    immediate?: boolean
    refetchOnWindowFocus?: boolean
    cacheDurationMinutes?: number
}

export function useApi<T>(endpoint: string, options: UseApiOptions = {}) {
    const { immediate = true, refetchOnWindowFocus = true, cacheDurationMinutes = 5 } = options
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
    const cacheKey = `api-cache-${cleanEndpoint}`
    const cached = getCache<T>(cacheKey, cacheDurationMinutes)

    const [state, setState] = useState<ApiState<T>>({
        data: cached.data,
        isLoading: !cached.data,
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
                    : 'خطای ناشناخته هنگام دریافت اطلاعات.'
            setState(prev => ({ ...prev, error: message, isLoading: false }))
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
        !state.error &&
        (Array.isArray(state.data) ? state.data.length === 0 : !state.data)

    return { ...state, refetch, isEmpty }
}

export default useApi
