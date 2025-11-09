export interface UserDto {
    id: string
    phoneNumber: string
    fullName: string
    email?: string
    nationalCode?: string
    passwordHash?: string
    roles?: string[]
}