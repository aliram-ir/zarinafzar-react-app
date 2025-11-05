// 📁 مسیر فایل: src/api/apiService.ts (اصلاح شده برای رفع هشدار ESLint)
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
    throw new Error('Unreachable code') // خطای توسعه‌دهنده (Internal Dev Error)
}

/**
 * 🧠 رهگیر پاسخ‌ها
 * - کنترل خطای منطقی سرور
 * - مدیریت مجدد درخواست در صورت خطای شبکه
 */
api.interceptors.response.use(
    <T>(response: AxiosResponse<Result<T>>) => {
        const result = response.data

        // خطاهای سمت سرور (مثلاً IsSuccess=false)
        if (!result.isSuccess) {
            toast.error(result.message ?? 'عملیات با خطا مواجه شد.', { rtl: true })
            // 🛑 خطای منطقی سرور را به بالا منتقل می‌کنیم تا در هوک‌ها قابل مدیریت باشد
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

        // 🔁 در صورت خطای شبکه یا قطع سرور
        if (isNetworkError) {
            try {
                // تلاش مجدد برای اجرای درخواست
                const retried = await retryRequest(() =>
                    axios.request(axiosError.config as AxiosRequestConfig)
                )
                return retried
            } catch { // ⬅️ اصلاح: حذف `retryFailedError` برای رفع هشدار لینت
                // اگر تلاش مجدد شکست خورد، پیام فارسی را به کاربر نمایش می‌دهیم
                if (!serverUnavailableToastShown) {
                    toast.error('☁ سرور در دسترس نیست. لطفاً بعداً تلاش کنید.', { rtl: true })
                    serverUnavailableToastShown = true
                }

                // یک خطای جدید با پیام فارسی برای لایه‌های بالاتر می‌سازیم.
                const persianNetworkError = new Error('خطای اتصال به شبکه.')
                return Promise.reject(persianNetworkError)
            }
        }

        // 🚨 سایر خطاهای HTTP (۴xx و ۵xx)
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
