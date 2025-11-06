// 📁 src/components/ToastProvider.tsx
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// 🌈 کامپوننت مرکزی برای Toastها در کل برنامه
const ToastProvider = () => (
    <ToastContainer
        position="bottom-left"   // برای یکسانی با نسخه قبلی
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"         // هم‌رنگ با تم فعلی اپ
    />
)

export default ToastProvider
