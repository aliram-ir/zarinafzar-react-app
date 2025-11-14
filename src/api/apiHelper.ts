// 📁 src/api/apiHelper.ts

import api, { parseServerResponse } from './apiService'
import type { ApiResponse } from '@/types/apiResponse'
import { env } from '@/config/env'

/**
 * استخراج آرایه از ساختارهای نِستِد شده
 * این تابع تمام حالات ممکن رو چک می‌کنه
 */
function unwrapArray<T>(data: unknown): T[] | T {
    // 🔹 اگر خود data آرایه است
    if (Array.isArray(data)) {
        return data as T[]
    }

    // 🔹 اگر data یک object است، آرایه رو پیدا کن
    if (data && typeof data === 'object') {
        const obj = data as Record<string, unknown>

        // لیست کلیدهای احتمالی که ممکنه آرایه داشته باشن
        const arrayKeys = [
            'value', 'list', 'data', 'items',
            'Value', 'List', 'Data', 'Items',
            'result', 'Result', 'results', 'Results'
        ]

        for (const key of arrayKeys) {
            const value = obj[key]
            if (Array.isArray(value)) {
                return value as T[]
            }
        }

        // اگر هیچ کلیدی آرایه نداشت، خود obj رو برگردون
        // (شاید T یک object باشه نه آرایه)
    }

    // 🔹 در غیر این صورت، همون data رو برگردون
    return data as T
}

export async function getResult<T>(url: string, config?: object): Promise<T> {
    const res = await api.get<ApiResponse<T>>(url, config)
    const parsed = parseServerResponse<T>(res.data)

    if (!parsed.success) {
        throw new Error(parsed.message || 'عملیات با خطا مواجه شد.')
    }

    // اگر data خالی است، یک object/آرایه خالی برگردون
    if (!parsed.data) {
        return ([] as unknown as T)
    }

    // سعی کن آرایه رو استخراج کنی
    const unwrapped = unwrapArray<T>(parsed.data)

    // لاگ برای دیباگ
    if (env.isDevelopment) {
        console.log('📦 getResult:', {
            url,
            originalData: parsed.data,
            unwrappedData: unwrapped,
            isArray: Array.isArray(unwrapped)
        })
    }

    return unwrapped as T
}

export async function postResult<T>(
    url: string,
    body?: unknown,
    config?: object
): Promise<T> {
    const res = await api.post<ApiResponse<T>>(url, body, config)
    const parsed = parseServerResponse<T>(res.data)

    if (!parsed.success) {
        throw new Error(parsed.message || 'عملیات با خطا مواجه شد.')
    }

    return (parsed.data ?? ({} as T)) as T
}

export async function putResult<T>(
    url: string,
    body?: unknown,
    config?: object
): Promise<T> {
    const res = await api.put<ApiResponse<T>>(url, body, config)
    const parsed = parseServerResponse<T>(res.data)

    if (!parsed.success) {
        throw new Error(parsed.message || 'عملیات با خطا مواجه شد.')
    }

    return (parsed.data ?? ({} as T)) as T
}

export async function deleteResult<T>(url: string, config?: object): Promise<T> {
    const res = await api.delete<ApiResponse<T>>(url, config)
    const parsed = parseServerResponse<T>(res.data)

    if (!parsed.success) {
        throw new Error(parsed.message || 'عملیات با خطا مواجه شد.')
    }

    return (parsed.data ?? ({} as T)) as T
}

export default { getResult, postResult, putResult, deleteResult }
