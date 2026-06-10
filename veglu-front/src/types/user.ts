export interface UserResponseDto {
    userId: number
    email: string
    nickname: string
    bio: string | null
    profileImageUrl: string | null
    phone: string | null
}

export interface PageResponse<T> {
    content: T[]
    totalElements: number
    totalPages: number
    number: number
    size: number
    first: boolean
    last: boolean
}