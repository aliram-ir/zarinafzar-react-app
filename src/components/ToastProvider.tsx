import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// ✅ فقط Container مرکزی؛ منطق Toast در useApiMutation.ts قرار دارد.
export default function ToastProvider() {
    return (
        <ToastContainer
            position="top-center"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop={false}
            rtl
            closeOnClick
            pauseOnHover
            draggable
            pauseOnFocusLoss
            theme="light"
        />
    )
}
