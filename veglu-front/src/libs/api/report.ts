import { apiClient } from './client';

export type ReportCategory = 'ABUSE' | 'SEXUAL' | 'FALSE_REVIEW' | 'AD' | 'IRRELEVANT';
export type ReportStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';

export type ReviewReportResponse = {
    reportId: number;
    reviewId: number;
    reviewContent: string;
    reporterId: number;
    reporterNickname: string;
    category: ReportCategory;
    categoryLabel: string;
    detail?: string;
    status: ReportStatus;
    statusLabel: string;
    adminNote?: string;
    createdAt: string;
    resolvedAt?: string;
};

// 점주: 리뷰 신고
export async function createReport(data: {
    reviewId: number;
    category: ReportCategory;
    detail?: string;
}): Promise<ReviewReportResponse> {
    return apiClient('/review-report', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

// 관리자: 전체 신고 목록
export async function getAllReports(
    page = 0,
    size = 10
): Promise<{ content: ReviewReportResponse[]; totalPages: number; totalElements: number }> {
    return apiClient(`/review-report/admin?page=${page}&size=${size}`);
}

// 관리자: 상태별 신고 목록
export async function getReportsByStatus(
    status: ReportStatus,
    page = 0,
    size = 10
): Promise<{ content: ReviewReportResponse[]; totalPages: number; totalElements: number }> {
    return apiClient(`/review-report/admin/status/${status}?page=${page}&size=${size}`);
}

// 관리자: 신고 인정 → 리뷰 숨김
export async function resolveReport(
    reportId: number,
    adminNote?: string
): Promise<ReviewReportResponse> {
    return apiClient(`/review-report/admin/${reportId}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ adminNote }),
    });
}