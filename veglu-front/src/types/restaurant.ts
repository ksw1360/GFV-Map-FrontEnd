export type PriceRange = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH'
export type RestaurantStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'CLOSED'

export interface RestaurantResponseDto {
    name: string
    address: string
    addressDetail: string
    latitude: number
    longitude: number
    phone: string
    category: string
    subCategory: string
    priceRange: PriceRange
    businessHours: Record<string, unknown>
    holidays: string
    lastOrderTime: string
    hasParking: boolean
    hasRoom: boolean
    hasDelivery: boolean
    hasReservation: boolean
    paymentMethods: string[]
    amenities: string[]
    tags: string[]
    atmosphere: string[]
    snsLinks: Record<string, string>
    status: RestaurantStatus
    isVerified: boolean
}