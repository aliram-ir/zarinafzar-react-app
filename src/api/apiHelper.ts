// 📁 src/api/apiHelper.ts
import api, { parseServerResponse } from './apiService'
import type { ApiResponse } from './apiService'

/* ---------------------- Type Guards ---------------------- */

/** بررسی می‌کند که مقدار ورودی یک آرایه باشد */
function isArrayResponse<T>(value: unknown): value is T[] {
    return Array.isArray(value)
}

/** بررسی می‌کند که مقدار ورودی شیء با فیلد list یا items باشد */
function hasInnerArray<T>(
    value: unknown
): value is { list: T[] } | { items: T[] } {
    if (
        typeof value === 'object' &&
        value !== null &&
        ('list' in value || 'items' in value)
    ) {
        const obj = value as { list?: unknown; items?: unknown }
        return Array.isArray(obj.list) || Array.isArray(obj.items)
    }
    return false
}

/* ---------------------- GET ---------------------- */

export async function getResult<T>(url: string, config?: object): Promise<T> {
    const res = await api.get<ApiResponse<T>>(url, config)
    const parsed = parseServerResponse<T>(res.data)

    if (!parsed.success)
        throw new Error(parsed.message || 'عملیات با خطا مواجه شد.')

    const data = parsed.data as unknown

    // ✅ اگر آرایه است
    if (isArrayResponse<unknown>(data))
        return data as unknown as T

    // ✅ اگر شامل فیلد list یا items است
    if (hasInnerArray<unknown>(data)) {
        const inner =
            (data as { list?: unknown[]; items?: unknown[] }).list ??
            (data as { list?: unknown[]; items?: unknown[] }).items
        return inner as unknown as T
    }

    // ✅ اگر تهی است → آرایهٔ خالی به عنوان Type سازگار برگردان
    if (data === null || data === undefined)
        return [] as unknown as T

    // ✅ مقدار مستقیم را برگردان
    return data as T
}

/* ---------------------- POST ---------------------- */

export async function postResult<T>(
    url: string,
    body?: unknown,
    config?: object
): Promise<T> {
    const res = await api.post<ApiResponse<T>>(url, body, config)
    const parsed = parseServerResponse<T>(res.data)
    if (!parsed.success)
        throw new Error(parsed.message || 'عملیات با خطا مواجه شد.')
    return (parsed.data ?? ({} as unknown)) as T
}

/* ---------------------- PUT ---------------------- */

export async function putResult<T>(
    url: string,
    body?: unknown,
    config?: object
): Promise<T> {
    const res = await api.put<ApiResponse<T>>(url, body, config)
    const parsed = parseServerResponse<T>(res.data)
    if (!parsed.success)
        throw new Error(parsed.message || 'عملیات با خطا مواجه شد.')
    return (parsed.data ?? ({} as unknown)) as T
}

/* ---------------------- DELETE ---------------------- */

export async function deleteResult<T>(
    url: string,
    config?: object
): Promise<T> {
    const res = await api.delete<ApiResponse<T>>(url, config)
    const parsed = parseServerResponse<T>(res.data)
    if (!parsed.success)
        throw new Error(parsed.message || 'عملیات با خطا مواجه شد.')
    return (parsed.data ?? ({} as unknown)) as T
}

/* ---------------------- Export Object ---------------------- */

export const apiHelper = { getResult, postResult, putResult, deleteResult }
export default apiHelper
