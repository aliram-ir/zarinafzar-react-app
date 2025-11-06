import axios, {
    type AxiosInstance,
    type AxiosRequestConfig,
    type AxiosResponse,
} from 'axios'

/* -------------------------------------------------------------------------- */
/* 📦 مدل یکپارچه پاسخ سرور                                                   */
/* -------------------------------------------------------------------------- */
export interface ApiResponse<T> {
    success: boolean
    message: string
    data: T
    details?: string | null
    traceId?: string | null
}

/* -------------------------------------------------------------------------- */
/* ⚙️ پیکربندی کلاینت مرکزی Axios                                            */
/* -------------------------------------------------------------------------- */
const api: AxiosInstance = axios.create({
    baseURL: 'https://localhost:7009/api/',
    timeout: 10000,
})

/* -------------------------------------------------------------------------- */
/* 🧠 Parse تمام ساختارهای ممکن پاسخ سرور (Type‑Safe و مقاوم در برابر تو در تو) */
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

    const success = Boolean(
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
        (r2?.message as string | undefined) ??
        (r1?.message as string | undefined) ??
        (success ? 'عملیات با موفقیت انجام شد.' : 'عملیات با خطا مواجه شد.')

    // 🎯 داده نهایی
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
    ]

    let dataCandidate = candidates.find(
        x => Array.isArray(x) || (x && typeof x === 'object')
    ) as T

    if (!dataCandidate)
        dataCandidate = (r4 ?? r3 ?? r2 ?? r1).value as T

    return {
        success,
        message,
        data: (dataCandidate ??
            (Array.isArray(dataCandidate) ? ([] as T) : undefined)) as T,
        details:
            (r4?.details as string | null) ??
            (r3?.details as string | null) ??
            (r2?.details as string | null) ??
            null,
        traceId:
            (r4?.traceId as string | null) ??
            (r3?.traceId as string | null) ??
            (r2?.traceId as string | null) ??
            null,
    }
}

/* -------------------------------------------------------------------------- */
/* 🔁 تابع Retry خودکار با Backoff نمایی (برای خطاهای واقعی شبکه)            */
/* -------------------------------------------------------------------------- */
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
                throw new Error('☁ خطا در ارتباط با سرور (تلاش مجدد ناموفق).')
            await new Promise(r => setTimeout(r, delay * (i + 1)))
        }
    }
    throw new Error('☁ خطا در ارتباط با سرور.')
}

/* -------------------------------------------------------------------------- */
/* 🧱 Interceptor پاسخ‌ها                                                     */
/* -------------------------------------------------------------------------- */
api.interceptors.response.use(
    // ✅ مسیر موفق یا پاسخ منطقی
    <T>(response: AxiosResponse<ApiResponse<T>>) => {
        const parsed = parseServerResponse<T>(response.data)

        const newResponse: AxiosResponse<ApiResponse<T>> = {
            ...response,
            data: parsed,
        }
        return newResponse
    },

    // ⚠️ مسیر خطاها (فقط خطای واقعی شبکه ریجکت می‌شود)
    async (error: unknown) => {
        const err = error as {
            code?: string
            message?: string
            response?: AxiosResponse
            config?: AxiosRequestConfig
        }

        const isNetworkError =
            err.code === 'ERR_NETWORK' ||
            !err.response || // سرور پاسخی نداده (timeout, connection refused)
            err.message?.includes('Network Error')

        // ⚙️ در صورت قطع شبکه → Retry یا نمایش خطای ارتباطی
        if (isNetworkError) {
            try {
                return await retryRequest(() =>
                    axios.request(err.config as AxiosRequestConfig)
                )
            } catch {
                return Promise.reject(new Error('☁ خطا در ارتباط با سرور'))
            }
        }

        // ✅ چون سرور پاسخی داده (مثلاً 400, 422, 500) → پاسخ را resolve کن
        const response = err.response as AxiosResponse | undefined
        if (response) {
            const parsed = parseServerResponse(response.data)
            const newResponse: AxiosResponse<ApiResponse<unknown>> = {
                ...response,
                data: parsed,
            }
            return Promise.resolve(newResponse)
        }

        // 🚫 سایر خطاهای غیرقابل‌تشخیص
        const msg =
            (err.message && err.message.trim()) ||
            'خطای ناشناخته هنگام برقراری ارتباط با سرور.'
        return Promise.reject(new Error(msg))
    }
)

/* -------------------------------------------------------------------------- */
/* 🚀 خروجی نهایی کلاینت API                                                 */
/* -------------------------------------------------------------------------- */
export default api
