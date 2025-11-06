// 📁 مسیر فایل: src/hooks/useApiMutation.ts
import { useState, useCallback, useRef } from 'react'
import { toast } from 'react-toastify'
import type { AxiosError } from 'axios'

interface MutationOptions<TOutput> {
    onSuccess?: (data: TOutput) => void
    onError?: (error: unknown) => void
    optimisticData?: TOutput | ((prev: TOutput | null) => TOutput)
    rollbackData?: TOutput | null
}

// ✅ Type Guard برای تشخیص تابع بودن optimisticData
function isOptimisticFn<T>(
    value: T | ((prev: T | null) => T)
): value is (prev: T | null) => T {
    return typeof value === 'function'
}

/**
 * 🧠 هوک مرکزی برای Mutation Type-Safe
 * شامل: optimistic update، rollback و خطایابی دقیق
 * ❌ دیگر Toast موفقیت سراسری تولید نمی‌کند.
 */
export function useApiMutation<TInput, TOutput>(
    requestFn: (payload: TInput) => Promise<TOutput>,
    options?: MutationOptions<TOutput>
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

    const previousDataRef = useRef<TOutput | null>(null)

    const mutate = useCallback(
        async (payload: TInput) => {
            setState(prev => ({ ...prev, isLoading: true, error: null }))
            previousDataRef.current = state.data

            // 🌀 optimistic UI
            if (options?.optimisticData) {
                const optimisticValue = isOptimisticFn(options.optimisticData)
                    ? options.optimisticData(previousDataRef.current)
                    : options.optimisticData

                setState(prev => ({ ...prev, data: optimisticValue }))
            }

            try {
                const result = await requestFn(payload)
                setState({ isLoading: false, isSuccess: true, error: null, data: result })

                // ⛔ دیگر هیچ Toast پیش‌فرض موفقیت اجرا نمی‌شود
                options?.onSuccess?.(result)
            } catch (err: unknown) {
                const fallback = options?.rollbackData ?? previousDataRef.current
                if (fallback) setState(prev => ({ ...prev, data: fallback }))

                // 🧩 استخراج پیام خطا و نمایش آن
                let message = 'خطایی در انجام عملیات رخ داد.'
                if (err instanceof Error && err.message) message = err.message

                const axiosErr = err as AxiosError<{ message?: string }>
                if (axiosErr.response?.data?.message)
                    message = axiosErr.response.data.message

                if (/Network|ارتباط|سرور/i.test(message)) {
                    message = 'ارتباط با سرور برقرار نیست.'
                }

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
