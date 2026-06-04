'use client';

import { useState } from 'react';
import ReportedReviewCard from '@/components/admin/ReportedReviewCard';

const DUMMY_REPORTS = [
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
    {
        id: '3',
        author: 'abcd1234',
        content: '음식은 솔직히 기대 이하였고 전체적으로 관리가 잘 안 되는 느낌이었어요. 직원 응대도 너무 퉁명스러워서 주문하는 내내 불편했습니다.',
    },
];

export default function UserReportsPage() {
    const [reports, setReports] = useState(DUMMY_REPORTS);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    function handleDelete() {
        if (!deleteTarget) return;
        setReports((prev) => prev.filter((r) => r.id !== deleteTarget));
        setDeleteTarget(null);
    }

    function handleRelease(id: string) {
        setReports((prev) => prev.filter((r) => r.id !== id));
    }

    return (
        <div className="max-w-lg mx-auto px-5 py-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">신고된 리뷰</h2>

            {reports.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">신고된 리뷰가 없습니다.</p>
            ) : (
                <ul className="flex flex-col divide-y divide-gray-100">
                    {reports.map((review) => (
                        <ReportedReviewCard
                            key={review.id}
                            review={review}
                            onDelete={() => setDeleteTarget(review.id)}
                            onRelease={() => handleRelease(review.id)}
                        />
                    ))}
                </ul>
            )}

            {/* 삭제 확인 모달 */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
                    <div className="bg-white rounded-2xl shadow-xl px-6 py-5 w-full max-w-xs mx-4">
                        <p className="text-sm text-gray-700 text-center mb-5">리뷰를 삭제하시겠어요?</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                아니요
                            </button>
                            <button
                                onClick={handleDelete}
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