// 📁 src/api/apiService.ts
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'

/** 📦 مدل واحد پاسخ سرور */
export interface ApiResponse<T> {
    success: boolean
    message: string
    data: T
    details?: string | null
    traceId?: string | null
}

/** ⚙️ تنظیم کلاینت مرکزی Axios */
const api: AxiosInstance = axios.create({
    baseURL: 'https://localhost:7009/api/',
    timeout: 10000,
})

/* -------------------------------------------------------------------------- */
/* 🧠 Parse همه ساختارهای ممکن پاسخ سرور                                      */
/* -------------------------------------------------------------------------- */
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

    const success =
        Boolean(
            r4?.success ??
            r3?.success ??
            r2?.success ??
            r1.success ??
            r4?.isSuccess ??
            r3?.isSuccess ??
            r2?.isSuccess
        )

    const message =
        (r4?.message as string | undefined) ??
        (r3?.message as string | undefined) ??
        (r2.message as string | undefined) ??
        (r1.message as string | undefined) ??
        'عملیات با موفقیت انجام شد.'

    // 🎯 داده واقعی
    const candidates = [
        r4?.value,
        r3?.value,
        r2?.value,
        r4?.data,
        r3?.data,
        r2?.data,
        r4?.list,
        r3?.list,
        r2?.list,
        r4,
        r3,
        r2,
    ]

    let dataCandidate = candidates.find(
        x => Array.isArray(x) || (x && typeof x === 'object')
    ) as T

    if (!dataCandidate) dataCandidate = (r4 ?? r3 ?? r2 ?? r1).value as T

    return {
        success,
        message,
        data: (dataCandidate ?? (Array.isArray(dataCandidate) ? [] : undefined)) as T,
        details:
            (r4?.details as string | null) ??
            (r3?.details as string | null) ??
            (r2.details as string | null) ??
            null,
        traceId:
            (r4?.traceId as string | null) ??
            (r3?.traceId as string | null) ??
            (r2.traceId as string | null) ??
            null,
    }
}

/* -------------------------------------------------------------------------- */
/* 🧱 Interceptor پاسخ‌ها                                                     */
/* -------------------------------------------------------------------------- */
api.interceptors.response.use(
    <T>(response: AxiosResponse<ApiResponse<T>>) => {
        const parsed = parseServerResponse<T>(response.data)

        if (!parsed.success) {
            // ✨ به‌جای تغییر نوع با any،
            // یک کپی جدید از response بسازیم با نوع صحیح
            const newResponse: AxiosResponse<ApiResponse<T>> = {
                ...response,
                data: parsed,
            }
            return newResponse
        }

        return response
    },

    async (error: unknown) => {
        const err = error as {
            code?: string
            message?: string
            response?: AxiosResponse<{ message?: string }>
            config?: AxiosRequestConfig
        }

        const isNetworkError =
            err.code === 'ERR_NETWORK' ||
            !err.response ||
            err.message?.includes('Network Error')

        if (isNetworkError) {
            try {
                return await axios.request(err.config as AxiosRequestConfig)
            } catch {
                return Promise.reject(new Error('سرور در دسترس نیست.'))
            }
        }

        const msg =
            err.response?.data?.message ??
            err.message ??
            'خطای ناشناخته از سمت سرور.'
        return Promise.reject(new Error(msg))
    }
)


export default api
