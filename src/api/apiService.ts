// 📁 مسیر: src/api/apiService.ts
import axios, {
    type AxiosInstance,
    type AxiosRequestConfig,
    type AxiosResponse,
} from 'axios'
import { toast } from 'react-toastify'
import { env } from '@/config/env'
import type { ApiResponse } from '@/types/apiResponse'


// ✅ استفاده از تنظیمات
const api: AxiosInstance = axios.create({
    baseURL: env.apiBaseUrl,
    timeout: env.apiTimeout,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
})

// ✅ لاگ در حالت توسعه
if (env.isDevelopment) {
    console.log('🌐 API Base URL:', env.apiBaseUrl)
}

export function parseServerResponse<T>(response: unknown): ApiResponse<T> {
    if (!response || typeof response !== 'object') {
        return {
            success: false,
            message: 'پاسخ نامعتبر از سرور.',
            data: undefined as T,
        }
    }

    const r1 = response as Record<string, unknown>
    const r2 = (r1.data ?? r1) as Record<string, unknown>
    const r3 = (r2.data ?? r2.value ?? r2.list ?? null) as Record<string, unknown> | null
    const r4 = (r3?.data ?? r3?.value ?? r3?.list ?? null) as Record<string, unknown> | null

    const success = Boolean(
        r4?.success ??
        r3?.success ??
        r2?.success ??
        r1.success ??
        r4?.isSuccess ??
        r3?.isSuccess ??
        r2?.isSuccess ??
        r1.isSuccess ??
        r4?.IsSuccess ??
        r3?.IsSuccess ??
        r2?.IsSuccess ??
        r1.IsSuccess
    )

    const message =
        (r4?.message as string | undefined) ??
        (r3?.message as string | undefined) ??
        (r2?.message as string | undefined) ??
        (r1?.message as string | undefined) ??
        (r4?.Message as string | undefined) ??
        (r3?.Message as string | undefined) ??
        (r2?.Message as string | undefined) ??
        (r1?.Message as string | undefined) ??
        (success ? 'عملیات با موفقیت انجام شد.' : 'عملیات با خطا مواجه شد.')

    const candidates = [
        r4?.value,
        r3?.value,
        r2?.value,
        r4?.Value,
        r3?.Value,
        r2?.Value,
        r4?.data,
        r3?.data,
        r2?.data,
        r4?.Data,
        r3?.Data,
        r2?.Data,
        r4?.list,
        r3?.list,
        r2?.list,
        r1.data,
        r1.value,
        r1.Value,
    ]

    const dataCandidate = candidates.find(x => x !== undefined && x !== null) as T | undefined

    return {
        success,
        message,
        data: (dataCandidate ?? (undefined as T)) as T,
        details:
            (r4?.details as string | null) ??
            (r3?.details as string | null) ??
            (r2?.details as string | null) ??
            (r1?.details as string | null) ??
            null,
        traceId:
            (r4?.traceId as string | null) ??
            (r3?.traceId as string | null) ??
            (r2?.traceId as string | null) ??
            (r1?.traceId as string | null) ??
            null,
    }
}

async function retryRequest<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    retries = 3,
    delay = 1500
): Promise<AxiosResponse<T>> {
    for (let i = 0; i < retries; i++) {
        try {
            return await requestFn()
        } catch {
            if (i === retries - 1)
                throw new Error('خطا در ارتباط با سرور (تلاش مجدد ناموفق).')
            await new Promise(r => setTimeout(r, delay * (i + 1)))
        }
    }
    throw new Error('خطا در ارتباط با سرور.')
}

// ✅ صف درخواست‌های در حال انتظار برای refresh
let isRefreshing = false
let failedQueue: Array<{
    resolve: (token: string) => void
    reject: (error: unknown) => void
}> = []

/**
 * پردازش صف درخواست‌های معلق
 */
const processQueue = (error: unknown = null, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error)
        } else if (token) {
            prom.resolve(token)
        }
    })
    failedQueue = []
}

// ✅ Request Interceptor: اضافه کردن AccessToken به هدرها
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken')
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// ✅ Response Interceptor: مدیریت خطا 401 و Refresh Token
api.interceptors.response.use(
    <T>(response: AxiosResponse<ApiResponse<T>>) => {
        const parsed = parseServerResponse<T>(response.data)
        const typedResponse: AxiosResponse<ApiResponse<T>> = {
            ...response,
            data: parsed,
        }

        // ✅ فقط خطاها نمایش داده می‌شوند
        if (!parsed.success) {
            toast.error(parsed.message, { rtl: true })
        }

        return typedResponse
    },
    async (error: unknown) => {
        const err = error as {
            code?: string
            message?: string
            response?: AxiosResponse
            config?: AxiosRequestConfig & { _retry?: boolean }
        }

        const originalRequest = err.config

        // ✅ مدیریت خطای 401 (Unauthorized)
        if (err.response?.status === 401 && originalRequest && !originalRequest._retry) {
            if (isRefreshing) {
                // اگر در حال refresh هستیم، درخواست را به صف اضافه می‌کنیم
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                })
                    .then(token => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`
                        }
                        return axios.request(originalRequest)
                    })
                    .catch(err => Promise.reject(err))
            }

            originalRequest._retry = true
            isRefreshing = true

            try {
                // تلاش برای refresh token
                const response = await axios.post<ApiResponse<{
                    accessToken: string
                    expiresAt: string
                }>>(
                    'https://localhost:7009/api/Auth/refresh-token',
                    {},
                    { withCredentials: true }
                )

                const parsed = parseServerResponse<{
                    accessToken: string
                    expiresAt: string
                }>(response.data)

                if (parsed.success && parsed.data?.accessToken) {
                    const newToken = parsed.data.accessToken
                    localStorage.setItem('accessToken', newToken)

                    // ✅ پردازش صف
                    processQueue(null, newToken)

                    // ✅ تلاش مجدد درخواست اصلی
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`
                    }
                    return axios.request(originalRequest)
                } else {
                    throw new Error('Refresh token failed')
                }
            } catch (refreshError) {
                // ✅ در صورت خطا، کاربر را logout کنیم
                processQueue(refreshError, null)
                localStorage.removeItem('accessToken')
                window.location.href = '/login'
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        // ✅ مدیریت خطاهای شبکه
        const isNetworkError =
            err.code === 'ERR_NETWORK' ||
            !err.response ||
            err.message?.includes('Network Error')

        if (isNetworkError) {
            toast.error('سرور در دسترس نیست.', { rtl: true })
            try {
                return await retryRequest(() =>
                    axios.request(err.config as AxiosRequestConfig)
                )
            } catch {
                return Promise.reject(new Error('سرور در دسترس نیست.'))
            }
        }

        // ✅ مدیریت سایر خطاها
        if (err.response) {
            const parsed = parseServerResponse(err.response.data)
            toast.error(parsed.message, { rtl: true })
            const adaptedResponse: AxiosResponse<ApiResponse<unknown>> = {
                ...err.response,
                data: parsed,
            }
            return Promise.resolve(adaptedResponse)
        }

        const msg =
            (err.message && err.message.trim()) ||
            'خطای ناشناخته هنگام ارتباط با سرور.'
        toast.error(msg, { rtl: true })
        return Promise.reject(new Error(msg))
    }
)

export default api
