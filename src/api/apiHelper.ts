// 📁 src/api/apiHelper.ts
import api, { parseServerResponse } from './apiService'
import type { ApiResponse } from './apiService'

/** 📥 متد GET */
export async function getResult<T>(url: string, config?: object): Promise<T> {
    const res = await api.get<ApiResponse<T>>(url, config)
    const parsed = parseServerResponse<T>(res.data)
    if (!parsed.success) throw new Error(parsed.message)
    return parsed.data
}

/** 📤 متد POST */
export async function postResult<T>(url: string, body?: unknown, config?: object): Promise<T> {
    const res = await api.post<ApiResponse<T>>(url, body, config)
    const parsed = parseServerResponse<T>(res.data)
    if (!parsed.success) throw new Error(parsed.message)
    return parsed.data
}

/** ✏️ متد PUT */
export async function putResult<T>(url: string, body?: unknown, config?: object): Promise<T> {
    const res = await api.put<ApiResponse<T>>(url, body, config)
    const parsed = parseServerResponse<T>(res.data)
    if (!parsed.success) throw new Error(parsed.message)
    return parsed.data
}

/** ❌ متد DELETE */
export async function deleteResult<T>(url: string, config?: object): Promise<T> {
    const res = await api.delete<ApiResponse<T>>(url, config)
    const parsed = parseServerResponse<T>(res.data)
    if (!parsed.success) throw new Error(parsed.message)
    return parsed.data
}

export const apiHelper = { getResult, postResult, putResult, deleteResult }
export default apiHelper
