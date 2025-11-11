import { useContext } from 'react'
import ConfirmDialogContext from 'src/providers/ConfirmDialogContext'

export const useConfirmDialog = () => {
    const ctx = useContext(ConfirmDialogContext)
    if (!ctx) throw new Error('useConfirmDialog باید داخل ConfirmDialogProvider استفاده شود')
    return ctx
}
