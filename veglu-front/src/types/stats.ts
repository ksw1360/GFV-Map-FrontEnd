export interface UserStatsResponseDto {
    statId: number
    totalUsers: number
    dailyAverage: number
    monthlyAverage: number
    operatingDays: number
    operatingMonths: number
    statDate: string
    createdAt: string
}