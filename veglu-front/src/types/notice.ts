export interface NoticeResponseDto {
    noticeId: number
    title: string
    content: string
    category: string | null
    isPinned: boolean
    isVisible: boolean
    viewCount: number
    authorNickname: string
    createdAt: string
    updatedAt: string | null
}

export interface NoticeCreateRequestDto {
    title: string
    content: string
    category?: string
    isPinned?: boolean
    isVisible?: boolean
}

export interface NoticeUpdateRequestDto {
    title?: string
    content?: string
    category?: string
    isPinned?: boolean
    isVisible?: boolean
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