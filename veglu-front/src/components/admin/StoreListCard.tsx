import Link from 'next/link'
import type { RestaurantResponseDto } from '@/types/restaurant'

export default function StoreListCard({
                                          store,
                                          index,
                                      }: {
    store: RestaurantResponseDto
    index: number
}) {
    const address = [store.address, store.addressDetail].filter(Boolean).join(' ')
    const description = store.tags?.length
        ? store.tags.map((t) => `#${t}`).join(' ')
        : store.category ?? ''

    return (
        <Link href={`/admin/stores/${index}`}>
            <div className="flex gap-4 px-4 py-4 border border-gray-200 rounded-xl bg-white hover:shadow-sm transition-shadow">
                {/* 썸네일 없으므로 카테고리 이니셜로 대체 */}
                <div className="w-14 h-14 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-400 text-lg font-bold">
                    {store.name.charAt(0)}
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">{store.name}</p>
                        {store.isVerified && (
                            <span className="text-xs bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded-full">인증</span>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{address}</p>
                    <p className="text-xs text-gray-400 line-clamp-1">{description}</p>
                </div>
            </div>
        </Link>
    )
}