'use client'

import { useEffect, useState } from 'react'
import type { ReviewReportResponseDto } from '@/types/reviewReport'
import { getReports, resolveReport, deleteReview } from '@/libs/reviewReportApi'
import ReportedReviewCard from '@/components/admin/ReportedReviewCard'
import { createPortal } from 'react-dom'

export default function UserReportsPage() {
    const [reports, setReports]             = useState<ReviewReportResponseDto[]>([])
    const [loading, setLoading]             = useState(true)
    const [error, setError]                 = useState<string | null>(null)
    const [page, setPage]                   = useState(0)
    const [totalPages, setTotalPages]       = useState(0)
    const [refresh, setRefresh]             = useState(0)
    const [deleteTarget, setDeleteTarget]   = useState<ReviewReportResponseDto | null>(null)
    const [resolveTarget, setResolveTarget] = useState<ReviewReportResponseDto | null>(null)
    const [adminNote, setAdminNote]         = useState('')
    const [actionLoading, setActionLoading] = useState(false)

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true)
            setError(null)
            try {
                const data = await getReports(page)
                setReports(data.content)
                setTotalPages(data.totalPages)
            } catch {
                setError('신고 목록을 불러오지 못했습니다.')
            } finally {
                setLoading(false)
            }
        }
        fetchReports()
    }, [page, refresh])

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return
        setActionLoading(true)
        try {
            await deleteReview(deleteTarget.reviewId)
            // 삭제한 건 목록에서 바로 제거
            setReports((prev) => prev.filter((r) => r.reportId !== deleteTarget.reportId))
        } catch {
            alert('삭제에 실패했습니다.')
        } finally {
            setActionLoading(false)
            setDeleteTarget(null)
        }
    }

    const handleResolveConfirm = async () => {
        if (!resolveTarget) return
        setActionLoading(true)
        const targetId = resolveTarget.reportId
        try {
            await resolveReport(targetId, adminNote || undefined)
            // 신고 해제 → 처리 완료 표시
            setReports((prev) =>
                prev.map((r) =>
                    r.reportId === targetId ? { ...r, status: 'RESOLVED' } : r
                )
            )
            // 3초 후 목록에서 제거
            setTimeout(() => {
                setReports((prev) => prev.filter((r) => r.reportId !== targetId))
            }, 3000)
        } catch {
            alert('처리에 실패했습니다.')
        } finally {
            setActionLoading(false)
            setResolveTarget(null)
            setAdminNote('')
        }
    }

    return (
        <>
            <div className="max-w-lg mx-auto px-5 py-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">신고된 리뷰</h2>

                {loading && (
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-gray-100 animate-pulse rounded-xl h-20" />
                        ))}
                    </div>
                )}

                {!loading && error && (
                    <div className="text-center py-10 text-red-500 text-sm">
                        {error}
                        <button
                            onClick={() => setRefresh((r) => r + 1)}
                            className="block mx-auto mt-2 text-indigo-500 hover:underline"
                        >
                            다시 시도
                        </button>
                    </div>
                )}

                {!loading && !error && reports.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-10">신고된 리뷰가 없습니다.</p>
                )}

                {!loading && !error && reports.length > 0 && (
                    <ul className="flex flex-col divide-y divide-gray-100">
                        {reports.map((report) => (
                            <ReportedReviewCard
                                key={report.reportId}
                                report={report}
                                onDelete={() => setDeleteTarget(report)}
                                onResolve={() => { setResolveTarget(report); setAdminNote('') }}
                            />
                        ))}
                    </ul>
                )}

                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                        <button
                            onClick={() => setPage((p) => p - 1)}
                            disabled={page === 0}
                            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50"
                        >
                            이전
                        </button>
                        <span className="px-3 py-1.5 text-sm text-gray-500">
                        {page + 1} / {totalPages}
                    </span>
                        <button
                            onClick={() => setPage((p) => p + 1)}
                            disabled={page >= totalPages - 1}
                            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50"
                        >
                            다음
                        </button>
                    </div>
                )}
            </div>

            {deleteTarget && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20">
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
                </div>,
                document.body
            )}

            {resolveTarget && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20">
                    <div className="bg-white rounded-2xl shadow-xl px-6 py-5 w-full max-w-xs mx-4">
                        <p className="text-sm font-medium text-gray-800 text-center mb-1">신고를 해제하시겠어요?</p>
                        <p className="text-xs text-gray-400 text-center mb-5">해당 리뷰가 다시 노출됩니다.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setResolveTarget(null)}
                                disabled={actionLoading}
                                className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleResolveConfirm}
                                disabled={actionLoading}
                                className="flex-1 py-2.5 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                {actionLoading ? '처리중…' : '해제'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    )
}