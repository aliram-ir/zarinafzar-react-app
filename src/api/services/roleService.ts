// 📁 src/api/services/roleService.ts

import { getResult, postResult, putResult, deleteResult } from '../apiHelper'
import type {
    Role,
    RoleCreateRequest,
    RoleUpdateRequest,
    AssignPermissionsRequest,
} from '@/types/role'

/**
 * 📜 دریافت لیست همه نقش‌ها
 */
export const getAllRoles = () => getResult<Role[]>('/admin/roles')

/**
 * 🔍 دریافت نقش بر اساس Id
 */
export const getRoleById = (id: string) => getResult<Role>(`/admin/roles/${id}`)

/**
 * 🔍 دریافت نقش بر اساس نام
 */
export const getRoleByName = (name: string) =>
    getResult<Role>(`/admin/roles/by-name/${name}`)

/**
 * ➕ ایجاد نقش جدید
 */
export const createRole = (payload: RoleCreateRequest) =>
    postResult<Role>('/admin/roles', payload)

/**
 * ✏️ بروزرسانی نقش
 */
export const updateRole = (id: string, payload: RoleUpdateRequest) =>
    putResult<Role>(`/admin/roles/${id}`, payload)

/**
 * 🗑️ حذف نقش
 */
export const deleteRole = (id: string) => deleteResult<void>(`/admin/roles/${id}`)

/**
 * 🔑 تخصیص پرمیژن‌ها به نقش
 */
export const assignPermissionsToRole = (
    roleId: string,
    payload: AssignPermissionsRequest
) => postResult<void>(`/admin/roles/${roleId}/assign-permissions`, payload.permissionIds)
