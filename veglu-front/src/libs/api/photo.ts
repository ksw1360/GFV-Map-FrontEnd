import { apiClient } from './client';

// 사진 목록 조회
export async function getPhotos(restaurant_id: number) {
    return apiClient(`/photo/restaurant/${restaurant_id}`);
}

// 사진 등록
export async function createPhoto(data: {
    url: string;
    type: 'RESTAURANT' | 'MENU';
    restaurant_id?: number;
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