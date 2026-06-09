import { apiClient } from '@/libs/api/client'
import type {
    NoticeResponseDto,
    NoticeCreateRequestDto,
    NoticeUpdateRequestDto,
    PageResponse,
} from '@/types/notice'

export async function getNoticesForAdmin(page = 0, size = 10): Promise<PageResponse<NoticeResponseDto>> {
    return apiClient(`/notice/admin/all?page=${page}&size=${size}`)
}

export async function createNotice(req: NoticeCreateRequestDto): Promise<NoticeResponseDto> {
    return apiClient('/notice/admin', {
        method: 'POST',
        body: JSON.stringify(req),
    })
}

export async function updateNotice(noticeId: number, req: NoticeUpdateRequestDto): Promise<NoticeResponseDto> {
    return apiClient(`/notice/admin/${noticeId}`, {
        method: 'PUT',
        body: JSON.stringify(req),
    })
}

export async function deleteNotice(noticeId: number): Promise<void> {
    return apiClient(`/notice/admin/${noticeId}`, { method: 'DELETE' })
}

export async function toggleVisibility(noticeId: number): Promise<NoticeResponseDto> {
    return apiClient(`/notice/admin/${noticeId}/visibility`, { method: 'PATCH' })
}