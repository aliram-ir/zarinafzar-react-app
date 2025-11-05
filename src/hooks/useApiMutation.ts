// 📁 مسیر فایل: src/hooks/useApiMutation.ts
// هوک جنریک برای مدیریت عملیات تغییردهنده (Mutation) با Optimistic UI و Rollback.

import { useState, useCallback, useRef } from 'react'
import { toast } from 'react-toastify'
import type { AxiosError } from 'axios' // فقط برای تایپ، نه برای اجرای کد

/**
 * ساختار Options برای پیکربندی useApiMutation.
 * TOutput: نوع داده‌ی خروجی (پاسخ موفق سرور).
 */
interface MutationOptions<TOutput> {
    onSuccess?: (data: TOutput) => void // callback پس از موفقیت
    onError?: (error: unknown) => void // callback پس از شکست

    /**
     * داده‌ی موقتی برای نمایش Optimistic. می‌تواند یک شیء یا تابعی باشد که
     * داده‌ی قبلی را گرفته و وضعیت Optimistic جدید را برمی‌گرداند.
     */
    optimisticData?: TOutput | ((prev: TOutput | null) => TOutput)

    /**
     * داده‌ی Fallback که در صورت شکست، برای Rollback استفاده می‌شود.
     * اگر تنظیم نشود، از previousDataRef (وضعیت قبل از جهش) استفاده می‌شود.
     */
    rollbackData?: TOutput | null
}

/**
 * هوک جنریک برای عملیات mutation (POST / PUT / DELETE)
 * با پشتیبانی از Optimistic UI، Rollback و مدیریت کامل وضعیت.
 * 
 * @param requestFn تابعی که عملیات API را اجرا می‌کند (مثل apiService.postResult).
 * @param options پیکربندی شامل onSuccess, onError, Optimistic UI و Rollback.
 */
export function useApiMutation<TInput, TOutput>(
    requestFn: (payload: TInput) => Promise<TOutput>,
    options?: MutationOptions<TOutput>
) {
    // 💡 مدیریت وضعیت هوک: isLoading, isSuccess, error, data
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

    // 💾 نگه‌داری نسخه قبلی دیتا برای Rollback
    // این مرجع بین رندرها ثابت می‌ماند و نیازی نیست در وابستگی‌های useCallback قرار گیرد
    const previousDataRef = useRef<TOutput | null>(null)

    // 🚀 تابع اصلی برای اجرای عملیات Mutation
    const mutate = useCallback(
        async (payload: TInput) => {
            setState(prev => ({ ...prev, isLoading: true, error: null }))

            // ذخیره‌ی وضعیت فعلی داده‌ها قبل از شروع جهش برای Rollback
            previousDataRef.current = state.data

            // ✅ اجرای Optimistic Update (اگر پیکربندی شده باشد)
            if (options?.optimisticData) {
                const optimisticValue =
                    typeof options.optimisticData === 'function'
                        ? (options.optimisticData as (prev: TOutput | null) => TOutput)(
                            previousDataRef.current
                        )
                        : options.optimisticData

                // به‌روزرسانی موقت وضعیت با داده‌ی خوشبینانه
                setState(prev => ({
                    ...prev,
                    data: optimisticValue,
                }))
            }

            try {
                // 📞 فراخوانی تابع API
                const result = await requestFn(payload)

                // 🟢 به‌روزرسانی وضعیت با نتیجه‌ی موفقیت‌آمیز سرور
                setState({
                    isLoading: false,
                    isSuccess: true,
                    error: null,
                    data: result,
                })

                // نمایش Toast موفقیت (مطابق دستور RTL)
                toast.success('عملیات با موفقیت انجام شد ✅', { rtl: true })
                options?.onSuccess?.(result)

            } catch (err: unknown) {
                // ❌ مدیریت خطا و Rollback

                // 🔁 انتخاب داده‌ی Rollback: اولویت با rollbackData، سپس داده‌ی ذخیره‌شده
                const fallback = options?.rollbackData ?? previousDataRef.current
                if (fallback !== undefined && fallback !== null) {
                    // اعمال Rollback به وضعیت قبل از Optimistic Update
                    setState(prev => ({ ...prev, data: fallback }))
                }

                // استخراج پیام خطا با هندلینگ Axios
                let message = 'خطایی در انجام عملیات رخ داد.'
                if (err instanceof Error) message = err.message

                // 💡 استفاده از Type Assertion برای خطای Axios
                const axiosErr = err as AxiosError<{ message?: string }>
                if (axiosErr.response?.data && typeof axiosErr.response.data === 'object' && 'message' in axiosErr.response.data) {
                    message = axiosErr.response.data.message as string
                }

                // نمایش Toast خطا (مطابق دستور RTL)
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
        // ⚠️ وابستگی state.data برای ثبت داده‌ی قبل از Mutation در previousDataRef ضروری است.
        [requestFn, options, state.data]
    )

    // 🔄 تابع Reset برای پاکسازی وضعیت هوک (بازگشت به حالت اولیه)
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
