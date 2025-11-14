export interface Permission {
    id: string
    name: string
    description?: string
}

export interface PermissionCreateRequest {
    name: string
    description?: string
}

export interface PermissionUpdateRequest {
    name: string
    description?: string
}

