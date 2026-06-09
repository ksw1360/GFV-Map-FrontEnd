import { apiClient } from '@/libs/api/client'
import type {
    ReviewReportResponseDto,
    PageResponse,
    ReportStatus,
} from '@/types/reviewReport'

export async function getReports(page = 0, size = 10): Promise<PageResponse<ReviewReportResponseDto>> {
    return apiClient(`/review-report/admin?page=${page}&size=${size}`)
}

export async function getReportsByStatus(status: ReportStatus, page = 0, size = 10): Promise<PageResponse<ReviewReportResponseDto>> {
    return apiClient(`/review-report/admin/status/${status}?page=${page}&size=${size}`)
}

export async function resolveReport(reportId: number, adminNote?: string): Promise<ReviewReportResponseDto> {
    return apiClient(`/review-report/admin/${reportId}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ adminNote: adminNote ?? null }),
    })
}

export async function deleteReview(reviewId: number): Promise<void> {
    return apiClient(`/review/${reviewId}`, { method: 'DELETE' })
}