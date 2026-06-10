'use client'

import { useState } from 'react'
import type { ReviewReportResponseDto } from '@/types/reviewReport'

interface Props {
    report: ReviewReportResponseDto
    onDelete:  () => void
    onResolve: () => void
}

export default function ReportedReviewCard({ report, onDelete, onResolve }: Props) {
    const [open, setOpen] = useState(false)
    const isPending = report.status === 'PENDING'

    return (
        <li className="py-4 relative">
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <UserIcon />
                    </div>
                    <span className="text-sm font-medium text-gray-800">
            {report.reporterNickname}
          </span>
                </div>

                <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              report.status === 'PENDING'  ? 'bg-yellow-100 text-yellow-700' :
                  report.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-500'
          }`}>
            {report.statusLabel}
          </span>
                    {isPending && (
                        <button
                            className="text-gray-400 hover:text-gray-700 p-1"
                            onClick={() => setOpen((v) => !v)}
                            aria-label="옵션"
                        >
                            <KebabIcon />
                        </button>
                    )}
                </div>
            </div>

            {/* 리뷰 본문 */}
            <p className="text-xs text-gray-600 leading-relaxed mt-2 whitespace-pre-line">
                {report.reviewContent}
            </p>

            {/* 신고 카테고리 + 상세 */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
        <span className="text-xs bg-orange-50 text-orange-500 px-2 py-0.5 rounded-full">
          {report.categoryLabel}
        </span>
                {report.detail && (
                    <span className="text-xs text-gray-400">&quot;{report.detail}&quot;</span>
                )}
                <span className="text-xs text-gray-300">
          {new Date(report.createdAt).toLocaleDateString('ko-KR')}
        </span>
            </div>

            {report.adminNote && (
                <p className="text-xs text-gray-400 mt-1 italic">관리자 메모: {report.adminNote}</p>
            )}

            {open && (
                <div className="absolute top-10 right-0 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[140px]">
                    <button
                        onClick={() => { setOpen(false); onDelete() }}
                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50"
                    >
                        리뷰 삭제
                    </button>
                    <button
                        onClick={() => { setOpen(false); onResolve() }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                        신고 해제
                    </button>
                </div>
            )}
        </li>
    )
}

function UserIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
        </svg>
    )
}

function KebabIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="1.5"/>
            <circle cx="12" cy="12" r="1.5"/>
            <circle cx="12" cy="19" r="1.5"/>
        </svg>
    )
}