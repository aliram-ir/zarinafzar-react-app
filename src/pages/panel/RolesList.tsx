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
import type { Role } from '@/types/role'

/* ------------------------- کامپوننت کوچک نمایش وضعیت -------------------------- */
const StateView: React.FC<{ loading?: boolean; error?: string | null; empty?: boolean }> = React.memo(
    ({ loading, error, empty }) => {
        if (loading) return <CircularProgress />
        if (error) return <Typography color="error">⚠️ {error}</Typography>
        if (empty) return <Typography color="text.secondary">هیچ نقشی یافت نشد</Typography>
        return null
    }
)

/* ------------------------- کامپوننت اصلی لیست نقش‌ها -------------------------- */
const RolesList: React.FC = () => {
    const { data, isLoading, error, refetch, isEmpty } = useApi<Role[]>('/admin/roles')

    // 🔸 وضعیت دیالوگ حذف
    const [openDelete, setOpenDelete] = useState(false)
    const [selectedRole, setSelectedRole] = useState<Role | null>(null)

    // 📌 باز کردن دیالوگ حذف
    const handleDeleteClick = (role: Role) => {
        setSelectedRole(role)
        setOpenDelete(true)
    }

    // 📌 تأیید حذف
    const handleConfirmDelete = () => {
        if (!selectedRole) return
        console.log('🗑 حذف نقش:', selectedRole)
        // TODO: فراخوانی API حذف نقش
        setOpenDelete(false)
        setSelectedRole(null)
    }

    // 📌 لغو حذف
    const handleCancelDelete = () => {
        setOpenDelete(false)
        setSelectedRole(null)
    }

    // 📌 هندل ویرایش
    const handleEdit = (role: Role) => {
        // TODO: باز کردن مودال یا صفحه ویرایش نقش
        console.log('✏️ ویرایش نقش:', role)
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
                                    <TableCell>تاریخ ایجاد</TableCell>
                                    <TableCell align="center">عملیات</TableCell>
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

                                        <TableCell>
                                            {role.createdAt
                                                ? new Date(role.createdAt).toLocaleDateString('fa-IR')
                                                : '-'}
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
                message={`آیا از حذف نقش «${selectedRole?.name}» مطمئنی؟`}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
        </Box>
    )
}

export default React.memo(RolesList)