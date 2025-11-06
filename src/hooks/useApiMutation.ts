// 📁 src/hooks/useApiMutation.ts
import { useState, useCallback, useRef } from 'react'
import { toast } from 'react-toastify'
import type { AxiosError } from 'axios'

interface MutationOptions<TOutput> {
    onSuccess?: (data: TOutput) => void
    onError?: (error: unknown) => void
    optimisticData?: TOutput | ((prev: TOutput | null) => TOutput)
    rollbackData?: TOutput | null
}

/** تشخیص تابع بودن optimisticData */
function isOptimisticFn<T>(
    value: T | ((prev: T | null) => T)
): value is (prev: T | null) => T {
    return typeof value === 'function'
}

/**
 * 🔁 هوک اجرای Mutation عمومی با Toast خودکار
 * ✅ همه پیام‌ها از پاسخ API می‌آیند به جز خطای سرور/شبکه
 */
export function useApiMutation<
    TInput,
    TOutput extends { success?: boolean; message?: string }
>(
    requestFn: (payload: TInput) => Promise<TOutput>,
    options?: MutationOptions<TOutput>
) {
    const [state, setState] = useState({
        isLoading: false,
        isSuccess: false,
        error: null as string | null,
        data: null as TOutput | null,
    })

    const previousDataRef = useRef<TOutput | null>(null)

    const mutate = useCallback(
        async (payload: TInput) => {
            setState(prev => ({ ...prev, isLoading: true, error: null }))
            previousDataRef.current = state.data

            if (options?.optimisticData) {
                const optimisticValue = isOptimisticFn(options.optimisticData)
                    ? options.optimisticData(previousDataRef.current)
                    : options.optimisticData
                setState(prev => ({ ...prev, data: optimisticValue }))
            }

            try {
                const result = await requestFn(payload)

                // ✅ اگر سرور گفت success=false، یعنی خطا
                if (result && result.success === false) {
                    const msg = result.message || '❌ عملیات با خطا مواجه شد'
                    toast.error(msg, { rtl: true })
                    throw new Error(msg)
                }

                // 🟢 موفقیت واقعی
                setState({ isLoading: false, isSuccess: true, error: null, data: result })
                if (result?.message) toast.success(result.message, { rtl: true })
                options?.onSuccess?.(result)
            } catch (err) {
                const fallback = options?.rollbackData ?? previousDataRef.current
                if (fallback) setState(prev => ({ ...prev, data: fallback }))

                let message = 'خطایی در انجام عملیات رخ داد.'
                if (err instanceof Error && err.message) message = err.message

                const axiosErr = err as AxiosError<{ message?: string }>
                if (axiosErr.response?.data?.message)
                    message = axiosErr.response.data.message

                // ❌ فقط خطاهای ارتباطی پیام ثابت دارند
                if (/Network|ارتباط|سرور|ECONNREFUSED|ERR_NETWORK/i.test(message)) {
                    message = '❌ امکان برقراری ارتباط با سرور وجود ندارد.'
                    toast.error(message, { rtl: true })
                }
                else {
                    toast.error(message, { rtl: true })
                }

                setState(prev => ({ ...prev, isLoading: false, isSuccess: false, error: message }))
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
