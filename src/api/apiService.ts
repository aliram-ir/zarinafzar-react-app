// 📁 مسیر فایل: src/api/apiService.ts
import axios from 'axios'
import type { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios'
import { toast } from 'react-toastify'
import type { Result } from '../types/result'

/**
 * 🧩 کلاینت مرکزی Axios با تنظیمات پایه
 */
const api: AxiosInstance = axios.create({
    baseURL: 'https://localhost:7009/api/',
    timeout: 10000,
})

// ✅ جلوگیری از نمایش چندباره Toast قطع سرور
let serverUnavailableToastShown = false

// ----------------------------------------------------------------------------
// 🧠 تابع کمکی مرکزی برای نرمال‌سازی پاسخ سرور
// حالا از همین در Interceptor و apiHelper استفاده می‌کنیم تا منطق واحد باشد.
// ----------------------------------------------------------------------------
export function parseServerResponse<T>(
    response: unknown
): { isSuccess: boolean; message?: string; value?: T } {
    if (typeof response !== 'object' || response === null) {
        return { isSuccess: false, message: 'ارتباط با سرور برقرار نیست.', value: undefined }
    }

    const resp = response as Record<string, unknown>
    const top = (resp.data ?? resp) as Record<string, unknown>
    const nested = (top.data ?? null) as Record<string, unknown> | null

    const result =
        nested && typeof nested.isSuccess === 'boolean' ? nested : top

    const value =
        (result.value as T) ??
        ((result.data as Record<string, unknown> | undefined)?.value as T) ??
        undefined

    return {
        isSuccess: Boolean(result.isSuccess),
        message:
            (result.message as string | undefined) ??
            (top.message as string | undefined) ??
            'عملیات با خطا مواجه شد.',
        value,
    }
}

/**
 * ♻️ تابع Retry با Backoff نمایی
 * - تا ۳ بار تلاش با تأخیر افزایشی
 */
const retryRequest = async <T>(
    requestFn: () => Promise<AxiosResponse<Result<T>>>,
    retries = 3,
    baseDelay = 1500
): Promise<AxiosResponse<Result<T>>> => {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            return await requestFn()
        } catch (err) {
            if (attempt === retries - 1) throw err
            const delay = baseDelay * (attempt + 1)
            await new Promise<void>(resolve => setTimeout(resolve, delay))
        }
    }
    throw new Error('Unreachable code')
}

/**
 * 🧠 رهگیر پاسخ‌ها
 * - کنترل خطاهای منطقی سرور با parseServerResponse
 * - Retry در خطای شبکه
 */
api.interceptors.response.use(
    <T>(response: AxiosResponse<Result<T>>) => {
        const parsed = parseServerResponse<T>(response)

        // اگر سرور Success=false برگرداند، Toast فارسی و Reject
        if (!parsed.isSuccess) {
            toast.error(parsed.message ?? 'عملیات با خطا مواجه شد.', { rtl: true })
            return Promise.reject(response)
        }

        return response as AxiosResponse<Result<T>>
    },
    async (error: unknown) => {
        const axiosError = error as {
            code?: string
            message?: string
            response?: AxiosResponse<{ message?: string }>
            config?: AxiosRequestConfig
        }

        const isNetworkError =
            axiosError.code === 'ERR_NETWORK' ||
            axiosError.message?.includes('Network Error') ||
            !axiosError.response

        if (isNetworkError) {
            try {
                const retried = await retryRequest(() =>
                    axios.request(axiosError.config as AxiosRequestConfig)
                )
                return retried
            } catch {
                if (!serverUnavailableToastShown) {
                    toast.error('☁ سرور در دسترس نیست. لطفاً بعداً تلاش کنید.', { rtl: true })
                    serverUnavailableToastShown = true
                }
                const persianNetworkError = new Error('خطای اتصال به شبکه.')
                return Promise.reject(persianNetworkError)
            }
        }

        // سایر خطاهای HTTP
        const message =
            axiosError.response?.data?.message ?? 'خطای ناشناخته از سمت سرور.'
        toast.error(message, { rtl: true })
        return Promise.reject(error)
    }
)

// 🔄 ریست پرچم Toast هنگام بازگشت به حالت آنلاین
window.addEventListener('online', () => {
    serverUnavailableToastShown = false
})

export default api
