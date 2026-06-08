'use client';

import { use, useState, useEffect } from 'react';
import StoreTabs from '@/components/owner/StoreTabs';
import { getReviewsByRestaurant, getReplyByReview, createReply, updateReply, deleteReply } from '@/libs/api/review';
import { createReport, ReportCategory } from '@/libs/api/report';

type Review = {
    id: string;
    author: string;
    rating: number;
    content: string;
    reply?: string;
    replyId?: number;
};

type RestaurantReview = {
    reviewId: number;
    userNickname: string;
    rating: number;
    content: string;
    userProfileImageUrl?: string;
};

type SortType = '최신순' | '별점높은순' | '별점낮은순';

export default function ReviewsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilter, setShowFilter] = useState(false);
    const [sortType, setSortType] = useState<SortType>('최신순');
    const [replyTarget, setReplyTarget] = useState<Review | null>(null);
    const [replyText, setReplyText] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [reportTarget, setReportTarget] = useState<Review | null>(null);
    const [reportCategory, setReportCategory] = useState<ReportCategory>('ABUSE');
    const [reportDetail, setReportDetail] = useState('');

    useEffect(() => {
        async function fetchReviews() {
            try {
                setLoading(true);
                const data = await getReviewsByRestaurant(Number(id));
                const reviewsWithReply = await Promise.all(
                    data.content.map(async (r: RestaurantReview) => {
                        try {
                            const reply = await getReplyByReview(r.reviewId);
                            return {
                                id: String(r.reviewId),
                                author: r.userNickname,
                                rating: Number(r.rating),
                                content: r.content,
                                reply: reply?.content,
                                replyId: reply?.replyId,
                            };
                        } catch {
                            return {
                                id: String(r.reviewId),
                                author: r.userNickname,
                                rating: Number(r.rating),
                                content: r.content,
                            };
                        }
                    })
                );
                setReviews(reviewsWithReply);
            } catch (e) {
                console.error('리뷰 불러오기 실패', e);
            } finally {
                setLoading(false);
            }
        }
        fetchReviews();
    }, [id]);

    const sorted = [...reviews].sort((a, b) => {
        if (sortType === '별점높은순') return b.rating - a.rating;
        if (sortType === '별점낮은순') return a.rating - b.rating;
        return 0;
    });

    async function handleSubmitReply() {
        if (!replyTarget || !replyText.trim()) return;
        try {
            if (replyTarget.reply && replyTarget.replyId) {
                const updated = await updateReply(replyTarget.replyId, replyText);
                setReviews((prev) =>
                    prev.map((r) =>
                        r.id === replyTarget.id ? { ...r, reply: updated.content, replyId: updated.replyId } : r
                    )
                );
            } else {
                const created = await createReply({ reviewId: Number(replyTarget.id), content: replyText });
                setReviews((prev) =>
                    prev.map((r) =>
                        r.id === replyTarget.id ? { ...r, reply: created.content, replyId: created.replyId } : r
                    )
                );
            }
        } catch (e) {
            console.error('답글 저장 실패', e);
        }
        setReplyTarget(null);
        setReplyText('');
    }

    async function handleDeleteReply(reviewId: string) {
        const review = reviews.find((r) => r.id === reviewId);
        if (!review?.replyId) return;
        try {
            await deleteReply(review.replyId);
            setReviews((prev) =>
                prev.map((r) =>
                    r.id === reviewId ? { ...r, reply: undefined, replyId: undefined } : r
                )
            );
        } catch (e) {
            console.error('답글 삭제 실패', e);
        }
        setDeleteTarget(null);
    }

    async function handleSubmitReport() {
        if (!reportTarget) return;
        const targetId = reportTarget.id;

        // 모달 먼저 닫기
        setReportTarget(null);
        setReportDetail('');

        try {
            await createReport({
                reviewId: Number(targetId),
                category: reportCategory,
                detail: reportDetail,
            });
        } catch (e) {
            console.error('신고 실패', e);
        }

        // API 성공/실패 관계없이 화면에서 제거
        setReviews((prev) => prev.filter((r) => r.id !== targetId));
    }

    function handleSelectSort(type: SortType) {
        setSortType(type);
        setShowFilter(false);
    }

    if (loading) {
        return (
            <div className="max-w-lg mx-auto">
                <StoreTabs storeId={id} />
                <div className="flex items-center justify-center py-20">
                    <p className="text-sm text-gray-400">로딩 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto relative">
            <StoreTabs storeId={id} />

            <div className="px-5 py-4 flex flex-col">
                <div className="relative flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-gray-900">리뷰</h2>
                    <button
                        onClick={() => setShowFilter((v) => !v)}
                        className="p-1 text-gray-500 hover:text-gray-800"
                    >
                        <FilterIcon />
                    </button>
                    {showFilter && (
                        <div
                            className="absolute top-full right-0 mt-2 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[140px]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {(['최신순', '별점높은순', '별점낮은순'] as SortType[]).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => handleSelectSort(type)}
                                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 ${
                                        sortType === type ? 'text-green-700 font-medium' : 'text-gray-700'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {sortType !== '최신순' && (
                    <p className="text-xs text-green-700 mb-3">{sortType} 적용 중</p>
                )}

                {reviews.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-10">등록된 리뷰가 없습니다.</p>
                ) : (
                    <ul className="flex flex-col divide-y divide-gray-100">
                        {sorted.map((review) => (
                            <li key={review.id} className="py-4">
                                {/* 작성자 + 별점 */}
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                        <UserIcon />
                                    </div>
                                    <span className="text-sm font-medium text-gray-800">{review.author}</span>
                                    <StarRating rating={review.rating} />
                                </div>

                                {/* 리뷰 본문 */}
                                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line mb-3">
                                    {review.content}
                                </p>

                                {/* 답글 박스 */}
                                {review.reply && (
                                    <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-3">
                                        <p className="text-xs text-gray-500 font-medium mb-1">사장님 답글</p>
                                        <p className="text-xs text-gray-700 leading-relaxed">{review.reply}</p>
                                    </div>
                                )}

                                {/* 하단 버튼 */}
                                <div className="flex justify-end gap-3">
                                    {/* 신고 버튼 */}
                                    <button
                                        onClick={() => {
                                            setReportTarget(review);
                                            setReportCategory('ABUSE');
                                            setReportDetail('');
                                        }}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                        aria-label="신고"
                                    >
                                        <ReportIcon />
                                    </button>

                                    {/* 답글 버튼 */}
                                    <button
                                        onClick={() => {
                                            setReplyTarget(review);
                                            setReplyText(review.reply ?? '');
                                        }}
                                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 transition-colors"
                                    >
                                        <ReplyIcon />
                                        {review.reply && <span>수정하기</span>}
                                    </button>

                                    {/* 답글 삭제 버튼 */}
                                    {review.reply && (
                                        <button
                                            onClick={() => setDeleteTarget(review.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <TrashIcon />
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* 답글 작성/수정 패널 */}
            {replyTarget && (
                <div className="absolute inset-0 z-20 bg-white flex flex-col">
                    <div className="px-5 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
                                <UserIcon />
                            </div>
                            <span className="text-sm font-medium text-gray-800">{replyTarget.author}</span>
                            <StarRating rating={replyTarget.rating} />
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">{replyTarget.content}</p>
                    </div>
                    <div className="flex-1 px-5 py-4 flex flex-col">
            <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                maxLength={500}
                placeholder="내용을 입력하세요."
                style={{ height: '120px' }}
                className="w-full text-sm text-gray-700 resize-none outline-none border border-gray-200 rounded-xl p-3 placeholder:text-gray-300"
                autoFocus
            />
                        <div className="flex justify-between items-center mt-2">
                            <button
                                onClick={() => setReplyTarget(null)}
                                className="text-sm text-gray-400 hover:text-gray-700"
                            >
                                취소
                            </button>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-400">{replyText.length}/500</span>
                                <button
                                    onClick={handleSubmitReply}
                                    disabled={!replyText.trim()}
                                    className="px-5 py-2 text-sm font-medium text-white bg-green-700 rounded-lg disabled:opacity-40 hover:bg-green-800 transition-colors"
                                >
                                    {replyTarget.reply ? '수정완료' : '작성완료'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 답글 삭제 확인 모달 */}
            {deleteTarget && (
                <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/20">
                    <div className="bg-white rounded-2xl shadow-xl px-8 py-6 w-[280px] flex flex-col items-center gap-5">
                        <p className="text-sm font-medium text-gray-800">답글을 삭제하시겠어요?</p>
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                아니요
                            </button>
                            <button
                                onClick={() => handleDeleteReply(deleteTarget)}
                                className="flex-1 py-2.5 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors"
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 신고 모달 */}
            {reportTarget && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
                    onClick={() => setReportTarget(null)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl px-6 py-6 w-full max-w-sm mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-base font-semibold text-gray-900 mb-4">리뷰 신고</h2>

                        <div className="flex flex-col gap-2 mb-4">
                            {[
                                { value: 'ABUSE', label: '욕설/비방' },
                                { value: 'FALSE_REVIEW', label: '허위 리뷰' },
                                { value: 'AD', label: '광고성' },
                                { value: 'IRRELEVANT', label: '관련 없는 내용' },
                            ].map((item) => (
                                <label key={item.value} className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="category"
                                        value={item.value}
                                        checked={reportCategory === item.value}
                                        onChange={() => setReportCategory(item.value as ReportCategory)}
                                        className="accent-green-700"
                                    />
                                    <span className="text-sm text-gray-700">{item.label}</span>
                                </label>
                            ))}
                        </div>

                        <textarea
                            value={reportDetail}
                            onChange={(e) => setReportDetail(e.target.value)}
                            placeholder="상세 내용 입력 (선택)"
                            rows={3}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none resize-none placeholder:text-gray-300 mb-4"
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => setReportTarget(null)}
                                className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleSubmitReport}
                                className="flex-1 py-2.5 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors"
                            >
                                신고하기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => {
                const filled = rating >= star;
                const half = !filled && rating >= star - 0.5;
                return (
                    <svg key={star} width="12" height="12" viewBox="0 0 24 24">
                        <defs>
                            <linearGradient id={`half-${star}`}>
                                <stop offset="50%" stopColor="#f5a623" />
                                <stop offset="50%" stopColor="#e5e7eb" />
                            </linearGradient>
                        </defs>
                        <path
                            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                            fill={filled ? '#f5a623' : half ? `url(#half-${star})` : '#e5e7eb'}
                            stroke="none"
                        />
                    </svg>
                );
            })}
        </div>
    );
}

function UserIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
    );
}

function FilterIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
        </svg>
    );
}

function ReplyIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <line x1="8" y1="9" x2="16" y2="9" />
            <line x1="8" y1="12" x2="14" y2="12" />
        </svg>
    );
}

function TrashIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
        </svg>
    );
}

function ReportIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
            <line x1="4" y1="22" x2="4" y2="15"/>
        </svg>
    );
}