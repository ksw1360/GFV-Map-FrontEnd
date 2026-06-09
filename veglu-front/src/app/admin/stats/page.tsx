'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/libs/api/client'
import type { UserStatsResponseDto } from '@/types/stats'

export default function StatsPage() {
    const [stats, setStats]     = useState<UserStatsResponseDto | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError]     = useState<string | null>(null)

    useEffect(() => {
        const fetch = async () => {
            setLoading(true)
            setError(null)
            try {
                const data = await apiClient('/statistics/admin/users')
                setStats(data)
            } catch {
                setError('통계를 불러오지 못했습니다.')
            } finally {
                setLoading(false)
            }
        }
        fetch()
    }, [])

    return (
        <div className="max-w-lg mx-auto px-5 py-6">
            <h2 className="text-base font-semibold text-gray-900 mb-6">통계</h2>

            {loading && (
                <div className="flex flex-col gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-gray-100 animate-pulse rounded-2xl h-24" />
                    ))}
                </div>
            )}

            {!loading && error && (
                <div className="text-center py-10 text-red-500 text-sm">{error}</div>
            )}

            {!loading && !error && stats && (
                <div className="flex flex-col gap-4">
                    <div className="bg-white border border-gray-200 rounded-2xl px-6 py-5 flex items-center gap-4 shadow-sm">
                        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                            <UsersIcon />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 mb-1">총 사용자 수</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {stats.totalUsers.toLocaleString()}
                                <span className="text-sm font-medium text-gray-400 ml-1">명</span>
                            </p>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl px-6 py-5 flex items-center gap-4 shadow-sm">
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <DayIcon />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 mb-1">일 평균 사용자 수</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {stats.dailyAverage.toLocaleString()}
                                <span className="text-sm font-medium text-gray-400 ml-1">명</span>
                            </p>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl px-6 py-5 flex items-center gap-4 shadow-sm">
                        <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                            <MonthIcon />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 mb-1">월 평균 사용자 수</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {stats.monthlyAverage.toLocaleString()}
                                <span className="text-sm font-medium text-gray-400 ml-1">명</span>
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function UsersIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4a7c59" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
    )
}

function DayIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
        </svg>
    )
}

function MonthIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
    )
}