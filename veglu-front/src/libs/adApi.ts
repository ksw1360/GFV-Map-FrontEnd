import { apiClient } from '@/libs/api/client'
import type { AdResponseDto, AdCreateRequestDto, AdUpdateRequestDto } from '@/types/ad'

// GET /ad/admin/all  ← 전체 목록 (ADMIN)
export async function getAdsForAdmin(): Promise<AdResponseDto[]> {
    return apiClient('/ad/admin/all')
}

// POST /ad/admin  ← 등록
export async function createAd(req: AdCreateRequestDto): Promise<AdResponseDto> {
    return apiClient('/ad/admin', {
        method: 'POST',
        body: JSON.stringify(req),
    })
}

// PUT /ad/admin/{adId}  ← 수정
export async function updateAd(adId: number, req: AdUpdateRequestDto): Promise<AdResponseDto> {
    return apiClient(`/ad/admin/${adId}`, {
        method: 'PUT',
        body: JSON.stringify(req),
    })
}

// DELETE /ad/admin/{adId}  ← 삭제
export async function deleteAd(adId: number): Promise<void> {
    return apiClient(`/ad/admin/${adId}`, { method: 'DELETE' })
}