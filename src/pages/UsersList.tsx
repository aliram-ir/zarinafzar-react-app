import { useEffect, useState } from 'react'
import api from '../api/apiService'
import { Box, Typography, CircularProgress, Paper } from '@mui/material'

interface UserDto {
    id: number
    name: string
    email: string
}

const UsersList = () => {
    const [loading, setLoading] = useState(true)
    const [users, setUsers] = useState<UserDto[]>([])

    useEffect(() => {
        api.get('/Home/UsersList')
            .then(res => {
                setUsers(res.data.value)
            })
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    return (
        <Box p={3}>
            <Typography variant="h5" mb={2}>لیست کاربران</Typography>
            {loading ? (
                <CircularProgress />
            ) : (
                users.map(user => (
                    <Paper key={user.id} sx={{ p: 2, mb: 1 }}>
                        <Typography>{user.name} – {user.email}</Typography>
                    </Paper>
                ))
            )}
        </Box>
    )
}

export default UsersList
