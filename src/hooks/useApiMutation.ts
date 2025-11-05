import { useState, useCallback, useRef } from 'react'
import { toast } from 'react-toastify'
import type { AxiosError } from 'axios'

/**
 * هوک جنریک برای عملیات mutation (POST / PUT / DELETE)
 * با پشتیبانی از Optimistic UI، Rollback و مدیریت کامل وضعیت.
 */
export function useApiMutation<TInput, TOutput>(
    requestFn: (payload: TInput) => Promise<TOutput>,
    options?: {
        onSuccess?: (data: TOutput) => void
        onError?: (error: unknown) => void
        optimisticData?: TOutput | ((prev: TOutput | null) => TOutput)
        rollbackData?: TOutput | null
    }
) {
    const [state, setState] = useState<{
        isLoading: boolean
        isSuccess: boolean
        error: string | null
        data: TOutput | null
    }>({
        isLoading: false,
        isSuccess: false,
        error: null,
        data: null,
    })

    // نگه‌داری نسخه قبلی دیتا برای Rollback
    const previousDataRef = useRef<TOutput | null>(null)

    const mutate = useCallback(
        async (payload: TInput) => {
            setState(prev => ({ ...prev, isLoading: true, error: null }))
            previousDataRef.current = state.data

            // ✅ Optimistic Update
            if (options?.optimisticData) {
                const optimisticValue =
                    typeof options.optimisticData === 'function'
                        ? (options.optimisticData as (prev: TOutput | null) => TOutput)(
                            previousDataRef.current
                        )
                        : options.optimisticData

                setState(prev => ({
                    ...prev,
                    data: optimisticValue,
                }))
            }

            try {
                const result = await requestFn(payload)

                setState({
                    isLoading: false,
                    isSuccess: true,
                    error: null,
                    data: result,
                })

                toast.success('عملیات با موفقیت انجام شد ✅', { rtl: true })
                options?.onSuccess?.(result)
            } catch (err: unknown) {
                // 🔁 Rollback در صورت خطا
                const fallback = options?.rollbackData ?? previousDataRef.current
                if (fallback) {
                    setState(prev => ({ ...prev, data: fallback }))
                }

                // استخراج پیام خطا
                let message = 'خطایی رخ داد.'
                if (err instanceof Error) message = err.message
                const axiosErr = err as AxiosError<{ message?: string }>
                if (axiosErr.response?.data?.message)
                    message = axiosErr.response.data.message as string

                toast.error(message, { rtl: true })
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    isSuccess: false,
                    error: message,
                }))
                options?.onError?.(err)
            }
        },
        [requestFn, options, state.data]
    )

    const reset = useCallback(() => {
        setState({
            isLoading: false,
            isSuccess: false,
            error: null,
            data: null,
        })
    }, [])

    return { mutate, reset, ...state }
}
