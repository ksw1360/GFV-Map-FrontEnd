'use client'

import { useState, useEffect } from 'react'
import { getReviewsByRestaurant, deleteReview } from '@/libs/api/review'

interface Review {
    reviewId: number
    userProfileImageUrl?: string
    userNickname: string
    rating: number
    content: string
}

export default function AdminStoreReviewsPage({
                                                  params,
                                              }: {
    params: Promise<{ id: string }>
}) {
    const [reviews, setReviews]             = useState<Review[]>([])
    const [loading, setLoading]             = useState(true)
    const [refresh, setRefresh]             = useState(0)
    const [deleteTarget, setDeleteTarget]   = useState<number | null>(null)
    const [actionLoading, setActionLoading] = useState(false)
    const [id, setId]                       = useState<string | null>(null)

    useEffect(() => {
        params.then(({ id }) => setId(id))
    }, [params])

    useEffect(() => {
        if (!id) return
        const fetch = async () => {
            setLoading(true)
            try {
                const data = await getReviewsByRestaurant(Number(id))
                setReviews(data.content)
            } catch (e) {
                console.error('리뷰 불러오기 실패', e)
            } finally {
                setLoading(false)
            }
        }
        fetch()
    }, [id, refresh])

    async function handleDeleteConfirm() {
        if (!deleteTarget) return
        setActionLoading(true)
        try {
            await deleteReview(deleteTarget)
            setRefresh((r) => r + 1)
        } catch (e) {
            alert('삭제에 실패했습니다.')
        } finally {
            setActionLoading(false)
            setDeleteTarget(null)
        }
    }

    return (
        <div className="max-w-lg mx-auto px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900 mb-4">리뷰</h2>

            {loading && (
                <div className="flex flex-col gap-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-gray-100 animate-pulse rounded-xl h-20" />
                    ))}
                </div>
            )}

            {!loading && reviews.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-10">등록된 리뷰가 없습니다.</p>
            )}

            {!loading && reviews.length > 0 && (
                <ul className="flex flex-col divide-y divide-gray-100">
                    {reviews.map((review) => (
                        <li key={review.reviewId} className="py-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                        {review.userProfileImageUrl ? (
                                            <img
                                                src={review.userProfileImageUrl}
                                                alt={review.userNickname}
                                                className="w-full h-full object-cover rounded-full"
                                            />
                                        ) : (
                                            <UserIcon />
                                        )}
                                    </div>
                                    <span className="text-sm font-medium text-gray-800">{review.userNickname}</span>
                                    <span className="text-xs text-gray-400">★ {review.rating}</span>
                                </div>
                                <button
                                    onClick={() => setDeleteTarget(review.reviewId)}
                                    className="text-xs text-red-400 hover:text-red-600 transition-colors"
                                >
                                    삭제
                                </button>
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">{review.content}</p>
                        </li>
                    ))}
                </ul>
            )}

            {/* 삭제 확인 모달 */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
                    <div className="bg-white rounded-2xl shadow-xl px-6 py-5 w-full max-w-xs mx-4">
                        <p className="text-sm text-gray-700 text-center mb-1">리뷰를 삭제하시겠어요?</p>
                        <p className="text-xs text-gray-400 text-center mb-5">삭제하면 복구할 수 없습니다.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                disabled={actionLoading}
                                className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                아니요
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={actionLoading}
                                className="flex-1 py-2.5 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                                {actionLoading ? '처리중…' : '삭제'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function UserIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
        </svg>
    )
}