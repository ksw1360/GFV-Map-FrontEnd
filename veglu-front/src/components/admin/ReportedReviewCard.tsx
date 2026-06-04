'use client';

import { useState } from 'react';

type ReportedReview = {
    id: string;
    author: string;
    content: string;
};

export default function ReportedReviewCard({
                                               review,
                                               onDelete,
                                               onRelease,
                                           }: {
    review: ReportedReview;
    onDelete: () => void;
    onRelease: () => void;
}) {
    const [open, setOpen] = useState(false);

    return (
        <li className="py-4 relative z-0 hover:z-10">
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <UserIcon />
                    </div>
                    <span className="text-sm font-medium text-gray-800">{review.author}</span>
                </div>
                <button
                    className="text-gray-400 hover:text-gray-700 p-1"
                    onClick={() => setOpen((v) => !v)}
                    aria-label="옵션"
                >
                    <KebabIcon />
                </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed mt-2 whitespace-pre-line">
                {review.content}
            </p>

            {open && (
                <div className="absolute top-10 right-0 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px]">
                    <button
                        onClick={() => { setOpen(false); onDelete(); }}
                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50"
                    >
                        삭제
                    </button>
                    <button
                        onClick={() => { setOpen(false); onRelease(); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                        신고 해제
                    </button>
                </div>
            )}
        </li>
    );
}

function UserIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
    );
}

function KebabIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
        </svg>
    );
}