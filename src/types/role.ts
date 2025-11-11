// 📁 src/types/role.ts

/**
 * مدل نقش (Role)
 */
export interface Role {
    id: string
    name: string
    description?: string
    createdAt?: string
    updatedAt?: string
}

/**
 * درخواست ایجاد نقش جدید
 */
export interface RoleCreateRequest {
    name: string
    description?: string
}

/**
 * درخواست بروزرسانی نقش
 */
export interface RoleUpdateRequest {
    name: string
    description?: string
}

/**
 * درخواست تخصیص پرمیژن‌ها به نقش
 */
export interface AssignPermissionsRequest {
    permissionIds: string[]
}
