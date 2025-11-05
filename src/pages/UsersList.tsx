import React from 'react'
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
    TableRow
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import { useApi } from '@/hooks/useApi'
import type { UserDto } from '@/types/userDto'

/* ------------------------- کامپوننت کوچک نمایش وضعیت -------------------------- */
const StateView: React.FC<{ loading?: boolean; error?: string | null; empty?: boolean }> = React.memo(
    ({ loading, error, empty }) => {
        if (loading) return <CircularProgress />
        if (error) return <Typography color="error">⚠️ {error}</Typography>
        if (empty) return <Typography color="text.secondary">هیچ کاربری یافت نشد</Typography>
        return null
    }
)

/* ------------------------- کامپوننت اصلی لیست کاربران -------------------------- */
const UsersList: React.FC = () => {
    const { data, isLoading, error, refetch, isEmpty } = useApi<UserDto[]>('/Home/UsersList')

    return (
        <Box p={3}>
            {/* Header */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h5">لیست کاربران</Typography>
                <Button variant="outlined" onClick={refetch} startIcon={<RefreshIcon />} />
            </Box>

            {/* نمایش وضعیت اولیه */}
            <StateView loading={isLoading} error={error} empty={isEmpty} />

            {/* جدول داده‌ها */}
            {!isLoading && !error && !isEmpty && (
                <Box sx={{ overflowX: 'auto' }}>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>نام کامل</TableCell>
                                    <TableCell>ایمیل</TableCell>
                                    <TableCell>کد ملی</TableCell>
                                    <TableCell>شماره تلفن</TableCell>
                                    <TableCell>رمز عبور</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data?.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.id}</TableCell>
                                        <TableCell>{user.fullName}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.nationalCode}</TableCell>
                                        <TableCell>{user.phoneNumber}</TableCell>
                                        <TableCell>{user.passwordHash}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}
        </Box>
    )
}

export default React.memo(UsersList)
