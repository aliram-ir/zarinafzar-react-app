export interface ApiState<T> {
    data: T | null
    isLoading: boolean
    error: string | null
}