import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const ToastProvider = () => (
    <ToastContainer
        position="top-left"
        autoClose={3000}
        rtl
        newestOnTop
        theme="colored"
    />
)

export default ToastProvider
