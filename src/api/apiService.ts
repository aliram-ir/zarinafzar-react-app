// 📁 مسیر: src/api/apiService.ts
import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

/** 📦 ساختار واحد پاسخ سرور (قرارداد استاندارد نهایی) */
export interface ApiResponse<T> {
    success: boolean
    message: string
    data: T
    details?: string | null
    traceId?: string | null
}

/** ⚙️ کلاینت مرکزی Axios */
const api: AxiosInstance = axios.create({
    baseURL: 'https://localhost:7009/api/',
    timeout: 10000,
})

/* -------------------------------------------------------------------------- */
/* 🧠 تابع عمومی برای Parse امن و Type‑Safe پاسخ‌های تو در توی سرور           */
/* پوشش تمام ساختارهای ممکن: data.value, data.data.value, value               */
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
    const r3 = (r2.data ?? r2.value ?? null) as Record<string, unknown> | null
    const r4 = (r3?.data ?? r3?.value ?? null) as Record<string, unknown> | null

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
        'عملیات با خطا مواجه شد.'

    // 🎯 داده نهایی
    const dataCandidate =
        (r4?.value as T) ??
        (r3?.value as T) ??
        (r2.value as T) ??
        (r4?.data as T) ??
        (r3?.data as T) ??
        (r2.data as T)

    return {
        success,
        message,
        data: (dataCandidate ?? undefined) as T,
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
/* ♻️ Retry خودکار با Backoff نمایی (سه بار تلاش)                             */
/* -------------------------------------------------------------------------- */
async function retryRequest<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    retries = 3,
    baseDelay = 1500
): Promise<AxiosResponse<T>> {
    for (let i = 0; i < retries; i++) {
        try {
            return await requestFn()
        } catch {
            if (i === retries - 1) throw new Error('خطای اتصال به سرور.')
            await new Promise<void>(resolve =>
                setTimeout(resolve, baseDelay * (i + 1))
            )
        }
    }
    throw new Error('Unreachable retry block.')
}

/* -------------------------------------------------------------------------- */
/* 🧱 Interceptor پاسخ‌ها                                                     */
/* -------------------------------------------------------------------------- */
api.interceptors.response.use(
    <T>(response: AxiosResponse<ApiResponse<T>>) => {
        const parsed = parseServerResponse<T>(response.data)
        if (!parsed.success)
            return Promise.reject(new Error(parsed.message ?? 'عملیات با خطا مواجه شد.'))
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

        // 🚨 خطای شبکه → تلاش مجدد با backoff
        if (isNetworkError) {
            try {
                return await retryRequest(() =>
                    axios.request(err.config as AxiosRequestConfig)
                )
            } catch {
                return Promise.reject(new Error('☁ سرور در دسترس نیست.'))
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
