import { apiClient } from './client';

// 사진 목록 조회
export async function getPhotos(restaurantId: number) {
    return apiClient(`/photo/restaurant/${restaurantId}`);
}

// 사진 등록
export async function createPhoto(data: {
    url: string;
    type: 'RESTAURANT' | 'MENU';
    restaurantId?: number;
    menuId?: number;
    caption?: string;
    isMain?: boolean;
}) {
    return apiClient('/photo', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

// 사진 삭제
export async function deletePhoto(photoId: number) {
    return apiClient(`/photo/${photoId}`, {
        method: 'DELETE',
    });
}