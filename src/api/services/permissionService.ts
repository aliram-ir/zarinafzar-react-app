import { getResult, postResult, putResult, deleteResult } from '../apiHelper'
import type {
    Permission,
    PermissionCreateRequest,
    PermissionUpdateRequest
} from '@/types/Permission'


export const getAllPermissions = () => getResult<Permission[]>('/admin/Permissions')

export const getPermissionId = (id: string) => getResult<Permission>(`/admin/Permissions/${id}`)

export const getPermissionByName = (name: string) =>
    getResult<Permission>(`/admin/Permissions/by-name/${name}`)

export const createRole = (payload: PermissionCreateRequest) =>
    postResult<Permission>('/admin/Permissions', payload)

export const updateRole = (id: string, payload: PermissionUpdateRequest) =>
    putResult<Permission>(`/admin/Permissions/${id}`, payload)

export const deletePermission = (id: string) => deleteResult<void>(`/admin/Permissions/${id}`)

