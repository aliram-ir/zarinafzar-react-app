// 📁 مسیر: src/api/apiService.ts
import axios, {
    type AxiosInstance,
    type AxiosRequestConfig,
    type AxiosResponse,
} from 'axios'

/* -------------------------------------------------------------------------- */
/* 📦 مدل واحد پاسخ سرور                                                     */
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
    baseURL: 'https://localhost:70009/api/',
    timeout: 10000,
})

/* -------------------------------------------------------------------------- */
/* 🧠 Parse امن و Type‑Safe برای پوشش تمام ساختارهای ممکن پاسخ سرور          */
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

    // ✅ پوشش کامل تمام حالت‌ها (IsSuccess / isSuccess / success)
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

    // ✅ پیام نهایی
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

    // ✅ استخراج داده — شامل boolean هم
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

/* -------------------------------------------------------------------------- */
/* 🔁 Retry خودکار با Backoff نمایی برای قطع شبکه                             */
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
    // ✅ تمام پاسخ‌ها (حتی با کد 400 / 422) به‌صورت Resolve بازگردانده می‌شوند
    <T>(response: AxiosResponse<ApiResponse<T>>) => {
        const parsed = parseServerResponse<T>(response.data)
        const typedResponse: AxiosResponse<ApiResponse<T>> = {
            ...response,
            data: parsed,
        }
        return typedResponse
    },

    // ⚠️ فقط خطاهای واقعی شبکه Reject می‌شوند
    async (error: unknown) => {
        const err = error as {
            code?: string
            message?: string
            response?: AxiosResponse
            config?: AxiosRequestConfig
        }

        const isNetworkError =
            err.code === 'ERR_NETWORK' ||
            !err.response ||
            err.message?.includes('Network Error')

        // 🌐 در صورت خطای شبکه، تلاش مجدد انجام می‌شود
        if (isNetworkError) {
            try {
                return await retryRequest(() =>
                    axios.request(err.config as AxiosRequestConfig)
                )
            } catch {
                return Promise.reject(new Error('☁ سرور در دسترس نیست.'))
            }
        }

        // ✅ برای خطای منطقی (HTTP 400/422/500) resolve کنیم
        if (err.response) {
            const parsed = parseServerResponse(err.response.data)
            const adaptedResponse: AxiosResponse<ApiResponse<unknown>> = {
                ...err.response,
                data: parsed,
            }
            return Promise.resolve(adaptedResponse)
        }

        const msg =
            (err.message && err.message.trim()) ||
            'خطای ناشناخته هنگام ارتباط با سرور.'
        return Promise.reject(new Error(msg))
    }
)

/* -------------------------------------------------------------------------- */
/* 🚀 خروجی نهایی کلاینت API                                                  */
/* -------------------------------------------------------------------------- */
export default api
