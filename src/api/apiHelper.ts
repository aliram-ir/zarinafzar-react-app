import api from './apiService'
import type { Result } from '../types/result'

export async function getResult<T>(url: string, config?: object): Promise<T> {
    const response = await api.get<Result<T>>(url, config)
    const result = response.data

    if (!result.isSuccess) throw new Error(result.message ?? 'عملیات با خطا مواجه شد.')

    return result.value as T
}

export async function postResult<T>(
    url: string,
    body?: unknown,
    config?: object
): Promise<T> {
    const response = await api.post<Result<T>>(url, body, config)
    const result = response.data
    if (!result.isSuccess) throw new Error(result.message ?? 'عملیات با خطا مواجه شد.')
    return result.value as T
}

export async function putResult<T>(
    url: string,
    body?: unknown,
    config?: object
): Promise<T> {
    const response = await api.put<Result<T>>(url, body, config)
    const result = response.data
    if (!result.isSuccess) throw new Error(result.message ?? 'عملیات با خطا مواجه شد.')
    return result.value as T
}

export async function deleteResult<T>(
    url: string,
    config?: object
): Promise<T> {
    const response = await api.delete<Result<T>>(url, config)
    const result = response.data
    if (!result.isSuccess) throw new Error(result.message ?? 'عملیات با خطا مواجه شد.')
    return result.value as T
}

export const apiHelper = {
    getResult,
    postResult,
    putResult,
    deleteResult,
}

export default apiHelper
