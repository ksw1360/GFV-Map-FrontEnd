"use client";

import { useState } from 'react';
import StoreTabs from '@/components/owner/StoreTabs';
import ReviewReplyDrawer from "@/components/owner/ReviewReplyDrawer";

type Review = {
    id: string;
    author: string;
    content: string;
    reply?: string;
};

type FilterState = {
    hasPhoto: boolean;
    positive: boolean;
    negative: boolean;
    noReply: boolean;
};

const DUMMY_REVIEWS: Review[] = [
    {
        id: '1',
        author: 'abcd1234',
        content: '음식은 솔직히 기대 이하였고 전체적으로 관리가 잘 안 되는 느낌이었어요. 직원 응대도 너무 퉁명스러워서 주문하는 내내 불편했습니다.',
    },
    {
        id: '2',
        author: 'abcd1234',
        content: '음식은 솔직히 기대 이하였고 전체적으로 관리가 잘 안 되는 느낌이었어요. 직원 응대도 너무 퉁명스러워서 주문하는 내내 불편했습니다. 매장 위생 상태도 썩 좋아 보이지 않았고 다시 방문하고 싶은 마음은 안 드네요.',
    },
];

export default function ReviewClient({ params }: { params: { id: string } }) {
    const [reviews, setReviews] = useState<Review[]>(DUMMY_REVIEWS);
    const [showFilter, setShowFilter] = useState(false);
    const [filters, setFilters] = useState<FilterState>({
        hasPhoto: false, positive: false, negative: false, noReply: false,
    });
    const [replyTarget, setReplyTarget] = useState<Review | null>(null);
    const [replyText, setReplyText] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);

    function handleSubmitReply() {
        if (!replyTarget || !replyText.trim()) return;
        setReviews((prev) => prev.map((r) => (r.id === replyTarget.id ? { ...r, reply: replyText } : r)));
        setReplyTarget(null);
        setReplyText('');
    }

    function handleDeleteReply() {
        if (!deleteTarget) return;
        setReviews((prev) => prev.map((r) => (r.id === deleteTarget.id ? { ...r, reply: undefined } : r)));
        setDeleteTarget(null);
    }

    return (
        <div className="max-w-lg mx-auto relative">
            <StoreTabs storeId={params.id} />

            <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-gray-900">리뷰</h2>
                    <button className="p-1 text-gray-500 hover:text-gray-800" onClick={() => setShowFilter(true)}>
                        <FilterIcon />
                    </button>
                </div>

                <ul className="flex flex-col divide-y divide-gray-100">
                    {reviews.map((review) => (
                        <ReviewCard
                            key={review.id}
                            review={review}
                            onReply={() => { setReplyTarget(review); setReplyText(''); }}
                            onDelete={() => setDeleteTarget(review)}
                        />
                    ))}
                </ul>
            </div>

            {replyTarget && <ReviewReplyDrawer review={replyTarget} value={replyText} onChange={setReplyText} onSubmit={handleSubmitReply} onClose={() => setReplyTarget(null)} />}
        </div>
    );
}

function ReviewCard({ review, onReply, onDelete }: { review: Review; onReply: () => void; onDelete: () => void }) {
    return (
        <li className="py-4">
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"><UserIcon /></div>
                    <span className="text-sm font-medium text-gray-800">{review.author}</span>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                    <button onClick={onReply} className="text-gray-400 hover:text-yellow-500 transition-colors"><ReplyIcon /></button>
                    {review.reply && <button onClick={onDelete} className="text-gray-400 hover:text-red-500 transition-colors"><TrashIcon /></button>}
                </div>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed mt-2">{review.content}</p>
            {review.reply && (
                <div className="mt-2 pl-3 border-l-2 border-green-300">
                    <p className="text-xs text-gray-600">{review.reply}</p>
                </div>
            )}
        </li>
    );
}

function FilterIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
        </svg>
    );
}

function UserIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
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
            <path d="M8 10h8" />
            <path d="M8 14h5" />
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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