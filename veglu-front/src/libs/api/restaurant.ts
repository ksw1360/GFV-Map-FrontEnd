import { apiClient } from './client';

// 가게 상세 조회
export async function getRestaurant(id: number) {
    return apiClient(`/restaurant/${id}`);
}

// 내 가게 목록
export async function getMyRestaurants() {
    return apiClient('/restaurant/my');
}

// 가게 수정
export async function updateRestaurant(id: number, data: {
    name?: string;
    phone?: string;
    address?: string;
    status?: 'OPEN' | 'BREAK_TIME' | 'CLOSED';
    tags?: string[];
    businessHours?: Record<string, string>;
}) {
    return apiClient(`/restaurant/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

// 메뉴 목록 조회
export async function getMenus(restaurantId: number) {
    return apiClient(`/restaurant/${restaurantId}/menus`);
}

// 메뉴 추가
export async function createMenu(data: {
    restaurantId: number;
    name: string;
    price?: number;
    description?: string;
    category?: string;
    veganType?: string;
    allergens?: string[];
    imageUrl?: string;
    isSignature?: boolean;
    isVegan?: boolean;
    isGlutenFree?: boolean;
    displayOrder?: number;
}) {
    return apiClient('/menu', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

// 메뉴 수정
export async function updateMenu(menuId: number, data: {
    name?: string;
    price?: number;
    description?: string;
    imageUrl?: string;
    category?: string;
    veganType?: string;
    allergens?: string[];
    isAvailable?: boolean;
}) {
    return apiClient(`/menu/${menuId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

// 메뉴 삭제
export async function deleteMenu(menuId: number) {
    return apiClient(`/menu/${menuId}`, { method: 'DELETE' });
}