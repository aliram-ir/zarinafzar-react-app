import React, { createContext, useState, useCallback } from 'react'
import ConfirmDialog from '@/components/common/ConfirmDialog'

interface ConfirmOptions {
    title?: string
    message: string
    confirmText?: string
    cancelText?: string
}

interface ConfirmDialogContextValue {
    showConfirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmDialogContext = createContext<ConfirmDialogContextValue | null>(null)

export const ConfirmDialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [open, setOpen] = useState(false)
    const [options, setOptions] = useState<ConfirmOptions | null>(null)
    const [resolver, setResolver] = useState<(value: boolean) => void>()

    const showConfirm = useCallback(
        (opts: ConfirmOptions) => {
            setOptions(opts)
            setOpen(true)
            return new Promise<boolean>((resolve) => {
                setResolver(() => resolve)
            })
        },
        []
    )

    const handleConfirm = useCallback(() => {
        resolver?.(true)
        setOpen(false)
        setOptions(null)
        setResolver(undefined)
    }, [resolver])

    const handleCancel = useCallback(() => {
        resolver?.(false)
        setOpen(false)
        setOptions(null)
        setResolver(undefined)
    }, [resolver])

    return (
        <ConfirmDialogContext.Provider value={{ showConfirm }}>
            {children}
            <ConfirmDialog
                open={open}
                title={options?.title}
                message={options?.message || ''}
                confirmText={options?.confirmText}
                cancelText={options?.cancelText}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </ConfirmDialogContext.Provider>
    )
}

export default ConfirmDialogContext
