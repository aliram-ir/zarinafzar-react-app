// 📁 مسیر: src/api/apiService.ts
import axios, {
    type AxiosInstance,
    type AxiosRequestConfig,
    type AxiosResponse,
} from 'axios'
import { toast } from 'react-toastify'
import { env } from '@/config/env'
import type { ApiResponse } from '@/types/apiResponse'

// =====================================
// 🔧 تنظیمات Axios Instance
// =====================================

const api: AxiosInstance = axios.create({
    baseURL: env.apiBaseUrl,
    timeout: env.apiTimeout,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
})

// لاگ در حالت توسعه
if (env.isDevelopment) {
    console.log('🌐 API Base URL:', env.apiBaseUrl)
}

// =====================================
// 🛠️ توابع کمکی تجزیه پاسخ
// =====================================

/**
 * استخراج یک فیلد از شیء با کلیدهای احتمالی مختلف
 */
function extractField<T = unknown>(
    obj: Record<string, unknown> | null | undefined,
    keys: string[]
): T | null {
    if (!obj) return null

    for (const key of keys) {
        const value = obj[key]
        if (value !== undefined && value !== null) {
            return value as T
        }
    }

    return null
}

/**
 * پیمایش لایه‌های نِستِد شده پاسخ سرور
 * @returns آرایه‌ای از لایه‌های یافت شده (حداکثر 4 لایه)
 */
function traverseLayers(response: unknown): Array<Record<string, unknown>> {
    if (!response || typeof response !== 'object') return []

    const layers: Array<Record<string, unknown>> = []
    let current = response as Record<string, unknown>

    // لایه 1: خود response
    layers.push(current)

    // لایه 2: data یا خود current
    current = (current.data ?? current) as Record<string, unknown>
    if (current && typeof current === 'object') {
        layers.push(current)
    }

    // لایه 3: data | value | list
    const layer3 = extractField<Record<string, unknown>>(current, ['data', 'value', 'list'])
    if (layer3 && typeof layer3 === 'object') {
        layers.push(layer3)

        // لایه 4: data | value | list از لایه سوم
        const layer4 = extractField<Record<string, unknown>>(layer3, ['data', 'value', 'list'])
        if (layer4 && typeof layer4 === 'object') {
            layers.push(layer4)
        }
    }

    return layers
}

/**
 * استخراج مقدار از تمام لایه‌ها با اولویت‌بندی کلیدها
 */
function extractFromLayers<T>(
    layers: Array<Record<string, unknown>>,
    keys: string[]
): T | null {
    for (const layer of layers) {
        const value = extractField<T>(layer, keys)
        if (value !== null) return value
    }
    return null
}

// =====================================
// 🔍 تجزیه پاسخ سرور (بهینه‌شده)
// =====================================

/**
 * تجزیه و تحلیل پاسخ سرور با پشتیبانی از ساختارهای مختلف
 */
export function parseServerResponse<T>(response: unknown): ApiResponse<T> {
    const layers = traverseLayers(response)

    if (layers.length === 0) {
        return {
            success: false,
            message: 'پاسخ نامعتبر از سرور.',
            data: undefined as T,
        }
    }

    // استخراج success
    const successKeys = ['success', 'isSuccess', 'IsSuccess']
    const success = Boolean(extractFromLayers<boolean>(layers, successKeys))

    // استخراج message
    const messageKeys = ['message', 'Message']
    const message =
        extractFromLayers<string>(layers, messageKeys) ??
        (success ? 'عملیات با موفقیت انجام شد.' : 'عملیات با خطا مواجه شد.')

    // استخراج data
    const dataKeys = ['value', 'Value', 'data', 'Data', 'list']
    const data = extractFromLayers<T>(layers, dataKeys) ?? (undefined as T)

    // استخراج details
    const detailsKeys = ['details', 'Details']
    const details = extractFromLayers<string>(layers, detailsKeys)

    // استخراج traceId
    const traceIdKeys = ['traceId', 'TraceId']
    const traceId = extractFromLayers<string>(layers, traceIdKeys)

    return {
        success,
        message,
        data: data as T,
        details,
        traceId,
    }
}

// =====================================
// 🔄 تلاش مجدد درخواست (Retry Logic)
// =====================================

/**
 * تلاش مجدد برای درخواست ناموفق
 */
async function retryRequest<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    retries = 3,
    delay = 1500
): Promise<AxiosResponse<T>> {
    for (let i = 0; i < retries; i++) {
        try {
            return await requestFn()
        } catch {
            if (i === retries - 1) {
                throw new Error('خطا در ارتباط با سرور (تلاش مجدد ناموفق).')
            }
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
        }
    }
    throw new Error('خطا در ارتباط با سرور.')
}

// =====================================
// 🔐 مدیریت Refresh Token
// =====================================

/**
 * صف درخواست‌های معلق در انتظار refresh token
 */
let isRefreshing = false
let failedQueue: Array<{
    resolve: (token: string) => void
    reject: (error: unknown) => void
}> = []

/**
 * پردازش صف درخواست‌های معلق
 */
function processQueue(error: unknown = null, token: string | null = null): void {
    failedQueue.forEach(promise => {
        if (error) {
            promise.reject(error)
        } else if (token) {
            promise.resolve(token)
        }
    })
    failedQueue = []
}

/**
 * ساخت URL صحیح با مدیریت slash
 */
function buildUrl(base: string, path: string): string {
    const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    return `${cleanBase}${cleanPath}`
}

// =====================================
// 🎯 Axios Interceptors
// =====================================

/**
 * Request Interceptor: اضافه کردن AccessToken به هدرها
 */
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

/**
 * Response Interceptor: مدیریت خطاها و Refresh Token
 */
api.interceptors.response.use(
    <T>(response: AxiosResponse<ApiResponse<T>>) => {
        const parsed = parseServerResponse<T>(response.data)
        const typedResponse: AxiosResponse<ApiResponse<T>> = {
            ...response,
            data: parsed,
        }

        // نمایش پیام خطا (فقط در صورت عدم موفقیت)
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

        // ====================================
        // 🔐 مدیریت خطای 401 (Unauthorized)
        // ====================================
        if (err.response?.status === 401 && originalRequest && !originalRequest._retry) {
            // اگر در حال refresh هستیم، درخواست را به صف اضافه می‌کنیم
            if (isRefreshing) {
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
                // 🔹 دریافت transportMode و refreshToken از localStorage
                const transportMode = localStorage.getItem('transport_mode') || 'cookie'
                const refreshToken = localStorage.getItem('refresh_token')

                // 🔹 تعیین بدنه درخواست بر اساس حالت انتقال
                const requestBody = transportMode === 'body' && refreshToken
                    ? { refreshToken }
                    : {}

                if (env.isDevelopment) {
                    console.log('🔄 Refresh Token Request:', {
                        transportMode,
                        hasRefreshToken: !!refreshToken,
                        bodyContent: requestBody
                    })
                }

                // ✅ ساخت URL صحیح با مدیریت slash
                const refreshUrl = buildUrl(env.apiBaseUrl, 'Auth/refresh-token')

                if (env.isDevelopment) {
                    console.log('🔗 Refresh URL:', refreshUrl)
                }

                // تلاش برای refresh token
                const response = await axios.post<ApiResponse<{
                    accessToken: string
                    expiresAt: string
                }>>(
                    refreshUrl,  // ✅ URL اصلاح شده
                    requestBody,  // ✅ بدنه درخواست بر اساس transportMode
                    { withCredentials: true }
                )

                const parsed = parseServerResponse<{
                    accessToken: string
                    expiresAt: string
                }>(response.data)

                if (parsed.success && parsed.data?.accessToken) {
                    const newToken = parsed.data.accessToken
                    localStorage.setItem('accessToken', newToken)

                    if (env.isDevelopment) {
                        console.log('✅ Access Token refreshed successfully')
                    }

                    // پردازش صف
                    processQueue(null, newToken)

                    // تلاش مجدد درخواست اصلی
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`
                    }
                    return axios.request(originalRequest)
                } else {
                    throw new Error('Refresh token failed')
                }
            } catch (refreshError) {
                console.error('❌ Refresh Token Failed:', refreshError)

                // در صورت خطا، کاربر را logout می‌کنیم
                processQueue(refreshError, null)
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refresh_token')
                localStorage.removeItem('transport_mode')

                window.location.href = '/login'
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        // ====================================
        // 🌐 مدیریت خطاهای شبکه
        // ====================================
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

        // ====================================
        // ⚠️ مدیریت سایر خطاها
        // ====================================
        if (err.response) {
            const parsed = parseServerResponse(err.response.data)
            toast.error(parsed.message, { rtl: true })
            const adaptedResponse: AxiosResponse<ApiResponse<unknown>> = {
                ...err.response,
                data: parsed,
            }
            return Promise.resolve(adaptedResponse)
        }

        // خطای پیش‌فرض
        const msg =
            (err.message && err.message.trim()) ||
            'خطای ناشناخته هنگام ارتباط با سرور.'
        toast.error(msg, { rtl: true })
        return Promise.reject(new Error(msg))
    }
)

export default api
