'use client'

import { useEffect, useState, useMemo } from 'react'
import type { RestaurantResponseDto } from '@/types/restaurant'
import { getRestaurantList } from '@/libs/restaurantApi'
import StoreListCard from '@/components/admin/StoreListCard'

export default function StoresPage() {
    const [allStores, setAllStores] = useState<RestaurantResponseDto[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [input, setInput] = useState('')

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true)
            setError(null)
            try {
                const data = await getRestaurantList(undefined)
                setAllStores(data)
            } catch {
                setError('가게 목록을 불러오지 못했습니다.')
            } finally {
                setLoading(false)
            }
        }
        fetchAll()
    }, [])

    const stores = useMemo(() => {
        if (!input.trim()) return allStores
        return allStores.filter((s) =>
            s.name.toLowerCase().includes(input.toLowerCase())
        )
    }, [input, allStores])

    function handleClear() {
        setInput('')
    }

    return (
        <div className="max-w-lg mx-auto px-5 py-6">
            {/* 검색바 */}
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 mb-4">
                <SearchIcon />
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="가게 이름 검색"
                    className="flex-1 text-sm outline-none placeholder:text-gray-300"
                />
                {input && (
                    <button onClick={handleClear} className="text-gray-300 hover:text-gray-500">
                        <ClearIcon />
                    </button>
                )}
            </div>

            {loading && (
                <div className="flex flex-col gap-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-gray-100 animate-pulse rounded-xl h-24" />
                    ))}
                </div>
            )}

            {!loading && error && (
                <div className="text-center py-10 text-red-500 text-sm">{error}</div>
            )}

            {!loading && !error && (
                <ul className="flex flex-col gap-3">
                    {stores.length > 0 ? (
                        stores.map((store, i) => (
                            <li key={`${store.name}-${i}`}>
                                <StoreListCard store={store} index={i + 1} />
                            </li>
                        ))
                    ) : (
                        <p className="text-sm text-gray-400 text-center py-10">
                            {input ? '검색 결과가 없습니다.' : '등록된 가게가 없습니다.'}
                        </p>
                    )}
                </ul>
            )}
        </div>
    )
}

function SearchIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
    )
}

function ClearIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
    )
}