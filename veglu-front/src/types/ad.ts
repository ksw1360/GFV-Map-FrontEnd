export interface AdResponseDto {
    adId: number
    title: string
    imageUrl: string | null
    linkUrl: string | null
    isActive: boolean
    createdAt: string
    updatedAt: string | null
}

export interface AdCreateRequestDto {
    title: string
    imageUrl?: string
    linkUrl?: string
    isActive?: boolean
}

export interface AdUpdateRequestDto {
    title?: string
    imageUrl?: string
    linkUrl?: string
    isActive?: boolean
}