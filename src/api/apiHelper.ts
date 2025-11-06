import api, { parseServerResponse } from './apiService'
import type { ApiResponse } from './apiService'

export async function getResult<T>(url: string, config?: object): Promise<T> {
    const res = await api.get<ApiResponse<T>>(url, config)
    const parsed = parseServerResponse<T>(res.data)
    if (!parsed.success) throw new Error(parsed.message || 'عملیات با خطا مواجه شد.')
    return (parsed.data ?? ({} as T)) as T
}

export async function postResult<T>(
    url: string,
    body?: unknown,
    config?: object
): Promise<T> {
    const res = await api.post<ApiResponse<T>>(url, body, config)
    const parsed = parseServerResponse<T>(res.data)
    if (!parsed.success) throw new Error(parsed.message || 'عملیات با خطا مواجه شد.')
    return (parsed.data ?? ({} as T)) as T
}

export async function putResult<T>(
    url: string,
    body?: unknown,
    config?: object
): Promise<T> {
    const res = await api.put<ApiResponse<T>>(url, body, config)
    const parsed = parseServerResponse<T>(res.data)
    if (!parsed.success) throw new Error(parsed.message || 'عملیات با خطا مواجه شد.')
    return (parsed.data ?? ({} as T)) as T
}

export async function deleteResult<T>(url: string, config?: object): Promise<T> {
    const res = await api.delete<ApiResponse<T>>(url, config)
    const parsed = parseServerResponse<T>(res.data)
    if (!parsed.success) throw new Error(parsed.message || 'عملیات با خطا مواجه شد.')
    return (parsed.data ?? ({} as T)) as T
}

export default { getResult, postResult, putResult, deleteResult }
