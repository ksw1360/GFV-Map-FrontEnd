export type ReportStatus = 'PENDING' | 'RESOLVED' | 'DISMISSED'
export type ReportCategory = 'ABUSE' | 'FALSE_REVIEW' | 'AD' | 'IRRELEVANT'

export interface ReviewReportResponseDto {
    reportId: number
    reviewId: number
    reviewContent: string        // 리뷰 본문 직접 포함
    reporterId: number
    reporterNickname: string
    category: ReportCategory
    categoryLabel: string        // 백엔드에서 한글로 내려줌 ex) "욕설/비방"
    detail: string | null
    status: ReportStatus
    statusLabel: string          // 백엔드에서 한글로 내려줌
    adminNote: string | null
    createdAt: string
    resolvedAt: string | null
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