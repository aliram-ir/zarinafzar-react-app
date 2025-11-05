import React, { Fragment } from 'react'
import { Box, Typography, CircularProgress, Paper, Button } from '@mui/material'
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
                <Button variant="outlined" onClick={refetch}>بازخوانی 🔄</Button>
            </Box>

            {/* نمایش وضعیت اولیه */}
            <StateView loading={isLoading} error={error} empty={isEmpty} />

            {/* داده‌ها */}
            {!isLoading && !error && !isEmpty && (
                <Fragment>
                    {data?.map(user => (
                        <Paper
                            key={user.id}
                            sx={{
                                p: 2,
                                mb: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                        >
                            <Typography>
                                {user.name} – {user.email}
                            </Typography>
                            {/* دکمه فرضی آینده برای عملیات (Edit/Delete) */}
                            {/* <IconButton color="primary"><EditIcon /></IconButton> */}
                        </Paper>
                    ))}
                </Fragment>
            )}
        </Box>
    )
}

export default React.memo(UsersList)
