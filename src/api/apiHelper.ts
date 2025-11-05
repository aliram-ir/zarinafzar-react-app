// 📁 مسیر فایل: src/api/apiHelper.ts
import api, { parseServerResponse } from './apiService'
import type { Result } from '../types/result'

/**
 * 📦 تابع عمومی برای اجرای درخواست GET با ساختار پاسخ استاندارد سرور
 */
export async function getResult<T>(url: string, config?: object): Promise<T> {
    const response = await api.get<Result<T>>(url, config)
    const parsed = parseServerResponse<T>(response.data)
    if (!parsed.isSuccess) throw new Error(parsed.message)
    return parsed.value as T
}

/**
 * 📤 ارسال داده با POST همراه با تحلیل پاسخ (Type‑Safe)
 */
export async function postResult<T>(
    url: string,
    body?: unknown,
    config?: object
): Promise<T> {
    const response = await api.post<Result<T>>(url, body, config)
    const parsed = parseServerResponse<T>(response.data)
    if (!parsed.isSuccess) throw new Error(parsed.message)
    return parsed.value as T
}

/**
 * ✏️ ویرایش داده با PUT همراه تحلیل استاندارد پاسخ سرور
 */
export async function putResult<T>(
    url: string,
    body?: unknown,
    config?: object
): Promise<T> {
    const response = await api.put<Result<T>>(url, body, config)
    const parsed = parseServerResponse<T>(response.data)
    if (!parsed.isSuccess) throw new Error(parsed.message)
    return parsed.value as T
}

/**
 * ❌ حذف داده با DELETE همراه تحلیل پاسخ سرور و کنترل خطاهای منطقی
 */
export async function deleteResult<T>(url: string, config?: object): Promise<T> {
    const response = await api.delete<Result<T>>(url, config)
    const parsed = parseServerResponse<T>(response.data)
    if (!parsed.isSuccess) throw new Error(parsed.message)
    return parsed.value as T
}

/**
 * 🔗 تجمیع توابع کمکی در یک آبجکت واحد برای دسترسی راحت‌تر
 */
export const apiHelper = {
    getResult,
    postResult,
    putResult,
    deleteResult,
}

export default apiHelper
