'use client';

import { use, useState } from 'react';
import StoreTabs from '@/components/owner/StoreTabs';

type Review = {
    id: string;
    author: string;
    rating: number;
    content: string;
    reply?: string;
};

const DUMMY_REVIEWS: Review[] = [
    {
        id: '1',
        author: 'abcd1234',
        rating: 3.5,
        content: '음식은 솔직히 기대 이하였고 전체적으로 관리가 잘 안 되는 느낌이었어요. 직원 응대도 너무 퉁명스러워서 주문하는 내내 불편했습니다.',
        reply: '안녕하세요',
    },
    {
        id: '2',
        author: 'abcd1234',
        rating: 4,
        content: '음식은 솔직히 기대 이하였고 전체적으로 관리가 잘 안 되는 느낌이었어요. 직원 응대도 너무 퉁명스러워서 주문하는 내내 불편했습니다. 매장 위생 상태도 썩 좋아 보이지 않았고 다시 방문하고 싶은 마음은 안 드네요.',
    },
    {
        id: '3',
        author: 'abcd1234',
        rating: 5,
        content: '음식이 정말 맛있었어요. 비건 메뉴인데도 맛이 전혀 부족하지 않았고 다시 방문하고 싶은 곳입니다.',
    },
];

type SortType = '최신순' | '별점높은순' | '별점낮은순';

export default function ReviewsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    const [reviews, setReviews] = useState<Review[]>(DUMMY_REVIEWS);
    const [showFilter, setShowFilter] = useState(false);
    const [sortType, setSortType] = useState<SortType>('최신순');
    const [replyTarget, setReplyTarget] = useState<Review | null>(null);
    const [replyText, setReplyText] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    const sorted = [...reviews].sort((a, b) => {
        if (sortType === '별점높은순') return b.rating - a.rating;
        if (sortType === '별점낮은순') return a.rating - b.rating;
        return 0;
    });

    function handleSubmitReply() {
        if (!replyTarget || !replyText.trim()) return;
        setReviews((prev) =>
            prev.map((r) => r.id === replyTarget.id ? { ...r, reply: replyText } : r)
        );
        setReplyTarget(null);
        setReplyText('');
    }

    function handleDeleteReply(id: string) {
        setReviews((prev) =>
            prev.map((r) => r.id === id ? { ...r, reply: undefined } : r)
        );
        setDeleteTarget(null);
    }

    function handleSelectSort(type: SortType) {
        setSortType(type);
        setShowFilter(false);
    }

    return (
        <div className="max-w-lg mx-auto relative">
            <StoreTabs storeId={id} />

            <div className="px-5 py-4 flex flex-col">
                {/* 헤더 */}
                <div className="relative flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-gray-900">
                        리뷰
                    </h2>

                    <button
                        onClick={() => setShowFilter((v) => !v)}
                        className="p-1 text-gray-500 hover:text-gray-800"
                    >
                        <FilterIcon />
                    </button>

                    {/* ✅ 필터 드롭다운 (반드시 헤더 안에 있어야 함) */}
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
                                        sortType === type
                                            ? 'text-green-700 font-medium'
                                            : 'text-gray-700'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* 현재 정렬 표시 */}
                {sortType !== '최신순' && (
                    <p className="text-xs text-green-700 mb-3">
                        {sortType} 적용 중
                    </p>
                )}

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
        </div>
    );
}

// ── 반개 별점 지원 ────────────────────────────────────
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
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {/* 말풍선 */}
            <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />

            {/* 내부 줄 (텍스트 느낌) */}
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