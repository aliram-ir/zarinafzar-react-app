import axios from 'axios'
import { toast } from 'react-toastify'
import type { AxiosResponse } from 'axios'
import type { Result } from '../types/result'

/**
 * ساخت instance اختصاصی axios با تنظیمات پایه پروژه
 */
const api = axios.create({
    baseURL: 'https://localhost:7243/api/',
    timeout: 10000,
})

/**
 * رهگیر پاسخ‌ها (Response Interceptor)
 * فقط نوتیفای و کنترل خطا انجام می‌دهد،
 * ولی پاسخ را به همان صورت AxiosResponse<Result<T>> برمی‌گرداند.
 */
api.interceptors.response.use(
    function <T>(response: AxiosResponse<Result<T>>): AxiosResponse<Result<T>> | Promise<AxiosResponse<Result<T>>> {
        const result = response.data

        if (!result.isSuccess) {
            toast.error(result.message ?? 'عملیات با خطا مواجه شد.')
            // ✅ مشخص کردن نوع در reject برای رفع TS2739
            return Promise.reject(response as AxiosResponse<Result<T>>)
        }

        return response
    },
    function (error) {
        if (error.code === 'ERR_NETWORK') {
            toast.error('ارتباط با سرور برقرار نیست!')
        } else if (error.response?.data?.message) {
            toast.error(error.response.data.message)
        } else {
            toast.error('خطای ناشناخته رخ داد.')
        }

        return Promise.reject(error)
    }
)

/**
 * تابع‌های کمک‌کننده Generic برای دسترسی ساده‌تر به API و Unwrap نتیجه
 * این‌ها داده‌ی واقعی (Result.value) رو برمی‌گردونن.
 */

// GET با Unwrap نتیجه
export async function getResult<T>(url: string, config?: object): Promise<T> {
    const res = await api.get<Result<T>>(url, config)
    if (!res.data.isSuccess) {
        toast.error(res.data.message ?? 'عملیات با خطا مواجه شد.')
        throw res.data
    }
    return res.data.value as T
}

// POST با Unwrap نتیجه
export async function postResult<T>(url: string, body?: unknown, config?: object): Promise<T> {
    const res = await api.post<Result<T>>(url, body, config)
    if (!res.data.isSuccess) {
        toast.error(res.data.message ?? 'عملیات با خطا مواجه شد.')
        throw res.data
    }
    return res.data.value as T
}

export default api
