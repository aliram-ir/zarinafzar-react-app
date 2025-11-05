import axios from 'axios'
import { toast } from 'react-toastify'
import type { AxiosResponse } from 'axios'
import type { Result } from '../types/result'

const api = axios.create({
    baseURL: 'https://localhost:7009/api/',
    timeout: 10000,
})

api.interceptors.response.use(
    function <T>(response: AxiosResponse<Result<T>>) {
        const result = response.data
        if (!result.isSuccess) {
            toast.error(result.message ?? 'عملیات با خطا مواجه شد.')
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

export default api
