import React from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    useMediaQuery,
    useTheme,
    Box
} from '@mui/material'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'

export interface ConfirmDialogProps {
    open: boolean
    title?: string
    message: string
    confirmText?: string
    cancelText?: string
    onConfirm: () => void
    onCancel: () => void
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    open,
    title = 'تأیید عملیات',
    message,
    confirmText = 'تأیید',
    cancelText = 'انصراف',
    onConfirm,
    onCancel
}) => {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

    return (
        <Dialog
            open={open}
            onClose={onCancel}
            dir="rtl"
            maxWidth="xs"
            fullWidth
            PaperProps={{ sx: { borderRadius: 2, p: 1 } }}
        >
            {/* عنوان دیالوگ */}
            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: 'error.main',
                    fontWeight: 600
                }}
            >
                <WarningAmberIcon color="error" />
                {title}
            </DialogTitle>

            {/* محتوای پیام */}
            <DialogContent dividers sx={{ py: 2 }}>
                <Typography fontSize={14}>{message}</Typography>
            </DialogContent>

            {/* دکمه‌ها */}
            <DialogActions sx={{ px: 2, pb: 2 }}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: 1, // فاصله واقعی بین دکمه‌ها (px)
                        width: '100%',
                    }}
                >
                    <Button
                        variant="contained"
                        color="error"
                        onClick={onConfirm}
                        startIcon={<CheckIcon />}
                        size="small"
                        fullWidth={isMobile}
                        sx={{
                            textTransform: 'none',
                            boxShadow: 'none',
                            minWidth: 100,
                            '&:hover': { boxShadow: 2, backgroundColor: 'error.dark' }
                        }}
                    >
                        {confirmText}
                    </Button>

                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={onCancel}
                        startIcon={<CloseIcon />}
                        size="small"
                        fullWidth={isMobile}
                        sx={{
                            textTransform: 'none',
                            minWidth: 80,
                            '&:hover': { backgroundColor: 'action.hover' }
                        }}
                    >
                        {cancelText}
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    )
}

export default React.memo(ConfirmDialog)
