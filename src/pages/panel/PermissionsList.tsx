import React, { useState } from 'react'
import {
    Box,
    Typography,
    CircularProgress,
    Paper,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Tooltip
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useApi } from '@/hooks/useApi'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import type { Permission } from '@/types/Permission'

/* ------------------------- کامپوننت کوچک نمایش وضعیت -------------------------- */
const StateView: React.FC<{ loading?: boolean; error?: string | null; empty?: boolean }> = React.memo(
    ({ loading, error, empty }) => {
        if (loading) return <CircularProgress />
        if (error) return <Typography color="error">⚠️ {error}</Typography>
        if (empty) return <Typography color="text.secondary">هیچ پرمیژنی یافت نشد</Typography>
        return null
    }
)

/* ------------------------- کامپوننت اصلی لیست نقش‌ها -------------------------- */
const PermissionsList: React.FC = () => {
    const { data, isLoading, error, refetch, isEmpty } = useApi<Permission[]>('/admin/permissions')

    // 🔸 وضعیت دیالوگ حذف
    const [openDelete, setOpenDelete] = useState(false)
    const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null)

    // 📌 باز کردن دیالوگ حذف
    const handleDeleteClick = (Permission: Permission) => {
        setSelectedPermission(Permission)
        setOpenDelete(true)
    }

    // 📌 تأیید حذف
    const handleConfirmDelete = () => {
        if (!selectedPermission) return
        console.log('🗑 حذف نقش:', selectedPermission)
        // TODO: فراخوانی API حذف نقش
        setOpenDelete(false)
        setSelectedPermission(null)
    }

    // 📌 لغو حذف
    const handleCancelDelete = () => {
        setOpenDelete(false)
        setSelectedPermission(null)
    }

    // 📌 هندل ویرایش
    const handleEdit = (Permission: Permission) => {
        // TODO: باز کردن مودال یا صفحه ویرایش نقش
        console.log('✏️ ویرایش نقش:', Permission)
    }

    return (
        <Box p={3}>
            {/* 🟢 هدر */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h5">مدیریت نقش‌ها</Typography>
                <Button
                    variant="outlined"
                    onClick={refetch}
                    startIcon={<RefreshIcon />}
                    disabled={isLoading}
                >
                    بارگذاری مجدد
                </Button>
            </Box>

            {/* 🟡 وضعیت داده */}
            <StateView loading={isLoading} error={error} empty={isEmpty} />

            {/* 🔵 جدول نقش‌ها */}
            {!isLoading && !error && !isEmpty && (
                <Box sx={{ overflowX: 'auto' }}>
                    <TableContainer component={Paper}>
                        <Table sx={{ direction: 'rtl' }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center">ردیف</TableCell>
                                    <TableCell sx={{ textAlign: 'right' }}>نام نقش</TableCell>
                                    <TableCell sx={{ textAlign: 'right' }}>توضیحات</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {data?.map((role, index) => (
                                    <TableRow key={role.id}>
                                        <TableCell align="center" width={50}>
                                            {index + 1}
                                        </TableCell>

                                        <TableCell sx={{ textAlign: 'right' }}>{role.name}</TableCell>

                                        <TableCell sx={{ textAlign: 'right' }}>
                                            {role.description || '-'}
                                        </TableCell>

                                        <TableCell align="center">
                                            <Tooltip title="ویرایش">
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => handleEdit(role)}
                                                    size="small"
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip title="حذف">
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleDeleteClick(role)}
                                                    size="small"
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            {/* 🔸 دیالوگ تأیید حذف */}
            <ConfirmDialog
                open={openDelete}
                title="تأیید حذف نقش"
                message={`آیا از حذف نقش «${selectedPermission?.name}» مطمئنی؟`}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
        </Box>
    )
}

export default React.memo(PermissionsList)