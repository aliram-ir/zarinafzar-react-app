// 📁 src/components/ToastProvider.tsx
import React from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

/**
 * پراپس کامپوننت ToastProvider
 */
interface ToastProviderProps {
    children: React.ReactNode
}

/**
 * کامپوننت Wrapper برای Toast
 */
const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    return (
        <>
            {children}
            <ToastContainer
                position="bottom-left"
                rtl
                newestOnTop
                autoClose={4000}
                pauseOnHover
                draggable
                theme="light"
            />
        </>
    )
}

export default ToastProvider
