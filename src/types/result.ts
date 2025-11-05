export interface Result<T> {
    isSuccess: boolean
    value: T | null
    message: string | null
    exception: unknown | null
}
