import axios from 'axios'
import { toast } from 'react-toastify'

// تنظیم baseUrl مرکزی
const api = axios.create({
    baseURL: 'https://localhost:7009/api/',
    timeout: 10000,
})

// هندل کردن خطاهای عمومی
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === 'ERR_NETWORK') {
            toast.error('ارتباط با سرور برقرار نیست!')
        } else if (error.response) {
            toast.error(`خطا: ${error.response.data?.message ?? 'درخواست ناموفق است'}`)
        } else {
            toast.error('خطای ناشناخته رخ داد.')
        }
        return Promise.reject(error)
    }
)

export default api
