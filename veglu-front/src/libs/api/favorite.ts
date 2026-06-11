import { apiClient } from './client';

export const toggleFavorite = async (restaurant_id: number) => {
    return apiClient(`/favorite/${restaurant_id}`, { method: 'POST' });
};

export const checkFavorite = async (restaurant_id: number): Promise<{ isFavorite: boolean }> => {
    return apiClient(`/favorite/check/${restaurant_id}`);
};

export const getMyFavorites = async (page = 0, size = 20) => {
    return apiClient(`/favorite/my?page=${page}&size=${size}`);
};