import { apiClient } from '@/libs/api/client'
import type { RestaurantResponseDto } from '@/types/restaurant'

export async function getRestaurantList(keyword?: string): Promise<RestaurantResponseDto[]> {
    const query = keyword ? `?keyword=${encodeURIComponent(keyword)}` : ''
    return apiClient(`/restaurant/name${query}`)
}