import React, { useEffect, useState } from 'react'
import { Box, Typography, CircularProgress, Paper } from '@mui/material'
import { getResult } from '../api/apiService' // ✅ استفاده از تابع جدید و تایپ‌دار
import type { UserDto } from '../types/userDto' // پیشنهاد میشه مدل جدا داشته باشه

const UsersList: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(true)
    const [users, setUsers] = useState<UserDto[]>([])

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // ✅ getResult خودش promise<UserDto[]> برمی‌گردونه (بدون Result<T>)
                const data = await getResult<UserDto[]>('/Home/UsersList')
                setUsers(data ?? [])
            } catch {
                // خطاها با toast در interceptor هندل می‌شن، اینجا نیازی به نمایش مجدد نیست
            } finally {
                setLoading(false)
            }
        }

        fetchUsers()
    }, [])

    return (
        <Box p={3}>
            <Typography variant="h5" mb={2}>
                لیست کاربران
            </Typography>

            {loading ? (
                <CircularProgress />
            ) : users.length === 0 ? (
                <Typography color="text.secondary">هیچ کاربری یافت نشد.</Typography>
            ) : (
                users.map((user) => (
                    <Paper key={user.id} sx={{ p: 2, mb: 1 }}>
                        <Typography>{user.name} – {user.email}</Typography>
                    </Paper>
                ))
            )}
        </Box>
    )
}

export default UsersList
