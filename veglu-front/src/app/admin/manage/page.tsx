'use client'

import { useEffect, useState } from 'react'
import type { NoticeResponseDto } from '@/types/notice'
import type { AdResponseDto } from '@/types/ad'
import {
    getNoticesForAdmin,
    createNotice,
    updateNotice,
    deleteNotice,
} from '@/libs/noticeApi'
import {
    getAdsForAdmin,
    createAd,
    updateAd,
    deleteAd,
} from '@/libs/adApi'

type Mode =
    | null
    | { type: 'notice'; action: 'create' }
    | { type: 'notice'; action: 'edit'; notice: NoticeResponseDto }
    | { type: 'ad'; action: 'create' }
    | { type: 'ad'; action: 'edit'; ad: AdResponseDto }

const NOTICE_CATEGORIES = ['서비스', '점검', '업데이트', '기타'] as const
const MAX = 400

export default function ManagePage() {
    const [notices, setNotices] = useState<NoticeResponseDto[]>([])
    const [ads, setAds] = useState<AdResponseDto[]>([])
    const [noticeLoading, setNoticeLoading] = useState(true)
    const [adLoading, setAdLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [noticeRefresh, setNoticeRefresh] = useState(0)
    const [adRefresh, setAdRefresh] = useState(0)
    const [mode, setMode] = useState<Mode>(null)
    const [title, setTitle] = useState('')
    const [text, setText] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const [category, setCategory] = useState('서비스')
    const [actionLoading, setActionLoading] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<
    | { type: 'notice'; notice: NoticeResponseDto }
    | { type: 'ad'; ad: AdResponseDto }
    | null
    >(null)

    useEffect(() => {
        const fetch = async () => {
            setNoticeLoading(true)
            try {
                const data = await getNoticesForAdmin()
                setNotices(data.content)
            } catch {
                setError('공지사항을 불러오지 못했습니다.')
            } finally {
                setNoticeLoading(false)
            }
        }
        fetch()
    }, [noticeRefresh])

    type AdApiResponse = AdResponseDto[] | { content: AdResponseDto[] }

    useEffect(() => {
        const fetch = async () => {
            setAdLoading(true)
            try {
                const data = await getAdsForAdmin() as AdApiResponse
                setAds(Array.isArray(data) ? data : data.content ?? [])
            } catch {
                setError('광고를 불러오지 못했습니다.')
            } finally {
                setAdLoading(false)
            }
        }
        fetch()
    }, [adRefresh])

    function openCreate(type: 'notice' | 'ad') {
        setTitle('')
        setText('')
        setImageUrl('')
        setCategory('서비스')
        setMode(type === 'notice'
            ? { type: 'notice', action: 'create' }
            : { type: 'ad', action: 'create' }
        )
    }

    function openEdit(type: 'notice' | 'ad', item: NoticeResponseDto | AdResponseDto) {
        if (type === 'notice') {
            const n = item as NoticeResponseDto
            setTitle(n.title)
            setText(n.content)
            setCategory(n.category ?? '기타')
            setImageUrl('')
            setMode({ type: 'notice', action: 'edit', notice: n })
        } else {
            const a = item as AdResponseDto
            setTitle(a.title)
            setText(a.linkUrl ?? '')
            setImageUrl(a.imageUrl ?? '')
            setMode({ type: 'ad', action: 'edit', ad: a })
        }
    }

    async function handleConfirm() {
        if (!mode) return
        setActionLoading(true)
        try {
            if (mode.type === 'notice') {
                if (!text.trim() || !title.trim()) return
                if (mode.action === 'create') {
                    await createNotice({ title: title.trim(), content: text.trim(), category })
                } else {
                    await updateNotice(mode.notice.noticeId, { title: title.trim(), content: text.trim(), category })
                }
                setNoticeRefresh((r) => r + 1)
            } else {
                if (!title.trim()) return
                if (mode.action === 'create') {
                    await createAd({
                        title: title.trim(),
                        linkUrl: text.trim() || undefined,
                        imageUrl: imageUrl.trim() || undefined,
                    })
                } else {
                    await updateAd(mode.ad.adId, {
                        title: title.trim(),
                        linkUrl: text.trim() || undefined,
                        imageUrl: imageUrl.trim() || undefined,
                    })
                }
                setAdRefresh((r) => r + 1)
            }
            setTitle('')
            setText('')
            setImageUrl('')
            setCategory('서비스')
            setMode(null)
        } catch {
            alert('처리에 실패했습니다.')
        } finally {
            setActionLoading(false)
        }
    }

    async function handleDelete() {
        if (!showDeleteConfirm) return
        setActionLoading(true)
        try {
            if (showDeleteConfirm.type === 'notice') {
                await deleteNotice(showDeleteConfirm.notice.noticeId)
                setNoticeRefresh((r) => r + 1)
            } else {
                await deleteAd(showDeleteConfirm.ad.adId)
                setAdRefresh((r) => r + 1)
            }
        } catch {
            alert('삭제에 실패했습니다.')
        } finally {
            setActionLoading(false)
            setShowDeleteConfirm(null)
        }
    }

    // 작성/수정 화면
    if (mode) {
        const isEdit = mode.action === 'edit'
        const isNotice = mode.type === 'notice'
        const sectionTitle = isNotice ? '공지사항' : '광고'

        return (
            <div className="max-w-lg mx-auto px-5 py-6">
                <button
                    onClick={() => { setTitle(''); setText(''); setImageUrl(''); setCategory('서비스'); setMode(null) }}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors"
                >
                    <ChevronLeftIcon />
                    뒤로가기
                </button>

                <h2 className="text-base font-semibold text-gray-900 mb-4">
                    {sectionTitle} {isEdit ? '수정' : '작성'}
                </h2>

                <div className="border border-gray-200 rounded-xl overflow-hidden mb-3">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={isNotice ? '제목을 입력하세요.' : '광고 제목을 입력하세요.'}
                        className="w-full px-4 py-3 text-sm text-gray-700 outline-none placeholder:text-gray-300 border-b border-gray-100"
                    />
                    {isNotice && (
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-3 text-sm text-gray-700 outline-none border-b border-gray-100 bg-white"
                        >
                            {NOTICE_CATEGORIES.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    )}
                    {!isNotice && (
                        <input
                            type="text"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="이미지 URL (필수)"
                            className="w-full px-4 py-3 text-sm text-gray-700 outline-none placeholder:text-gray-300 border-b border-gray-100"
                        />
                    )}
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value.slice(0, MAX))}
                        placeholder={isNotice ? '내용을 입력하세요.' : '링크 URL (선택)'}
                        className="w-full px-4 py-3 text-sm text-gray-700 resize-none outline-none placeholder:text-gray-300 min-h-[120px]"
                    />
                    <div className="flex justify-end px-4 py-2 text-xs text-gray-400 border-t border-gray-100">
                        {text.length}/{MAX}
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleConfirm}
                        disabled={!title.trim() || (isNotice && !text.trim()) || actionLoading}
                        className="px-6 py-2.5 text-sm font-medium text-white bg-green-700 rounded-full hover:bg-green-800 disabled:opacity-40 transition-colors"
                    >
                        {actionLoading ? '처리중…' : isEdit ? '수정완료' : '작성완료'}
                    </button>
                </div>
            </div>
        )
    }

    // 목록 화면
    return (
        <div className="max-w-lg mx-auto px-5 py-6">
            {/* 공지사항 섹션 */}
            <div className="mb-16">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-semibold text-gray-900">공지사항</h2>
                    <button
                        onClick={() => openCreate('notice')}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 text-xl leading-none"
                    >
                        +
                    </button>
                </div>

                {noticeLoading && (
                    <div className="flex flex-col gap-2">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-gray-100 animate-pulse rounded-xl h-12" />
                        ))}
                    </div>
                )}

                {!noticeLoading && error && (
                    <div className="text-center py-6 text-red-500 text-sm">
                        {error}
                        <button onClick={() => setNoticeRefresh((r) => r + 1)} className="block mx-auto mt-2 text-indigo-500 hover:underline">
                            다시 시도
                        </button>
                    </div>
                )}

                {!noticeLoading && (
                    <ul className="flex flex-col gap-2">
                        {notices.length > 0 ? notices.map((notice) => (
                            <NoticeItemCard
                                key={notice.noticeId}
                                notice={notice}
                                onEdit={() => openEdit('notice', notice)}
                                onDelete={() => setShowDeleteConfirm({ type: 'notice', notice })}
                            />
                        )) : (
                            <p className="text-sm text-gray-400 text-center py-6">공지사항이 없습니다.</p>
                        )}
                    </ul>
                )}
            </div>

            {/* 광고 섹션 */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-semibold text-gray-900">광고</h2>
                    <button
                        onClick={() => openCreate('ad')}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 text-xl leading-none"
                    >
                        +
                    </button>
                </div>

                {adLoading && (
                    <div className="flex flex-col gap-2">
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="bg-gray-100 animate-pulse rounded-xl h-12" />
                        ))}
                    </div>
                )}

                {!adLoading && (
                    <ul className="flex flex-col gap-2">
                        {ads.length > 0 ? ads.map((ad) => (
                            <AdItemCard
                                key={ad.adId}
                                ad={ad}
                                onEdit={() => openEdit('ad', ad)}
                                onDelete={() => setShowDeleteConfirm({ type: 'ad', ad })}
                            />
                        )) : (
                            <p className="text-sm text-gray-400 text-center py-6">등록된 광고가 없습니다.</p>
                        )}
                    </ul>
                )}
            </div>

            {/* 삭제 확인 모달 */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
                    <div className="bg-white rounded-2xl shadow-xl px-6 py-5 w-full max-w-xs mx-4">
                        <p className="text-sm text-gray-700 text-center mb-5">삭제하시겠어요?</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                disabled={actionLoading}
                                className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                아니요
                            </button>
                            <button
                                onClick={handleDelete}
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

function NoticeItemCard({
                            notice, onEdit, onDelete,
                        }: {
    notice: NoticeResponseDto
    onEdit: () => void
    onDelete: () => void
}) {
    const [open, setOpen] = useState(false)

    return (
        <li className="relative flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700">
            <div className="flex-1 pr-4 min-w-0">
                <div className="flex items-center gap-2">
                    {notice.category && (
                        <span className="text-xs bg-indigo-50 text-indigo-500 px-1.5 py-0.5 rounded-full shrink-0">
              {notice.category}
            </span>
                    )}
                    {notice.isPinned && (
                        <span className="text-xs bg-yellow-50 text-yellow-600 px-1.5 py-0.5 rounded-full shrink-0">고정</span>
                    )}
                    {!notice.isVisible && (
                        <span className="text-xs bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full shrink-0">숨김</span>
                    )}
                    <span className="font-medium truncate">{notice.title}</span>
                </div>
                <p className="text-xs text-gray-400 truncate mt-0.5">{notice.content}</p>
            </div>
            <button onClick={() => setOpen((v) => !v)} className="text-gray-400 hover:text-gray-700 flex-shrink-0">
                <KebabIcon />
            </button>
            {open && (
                <div className="absolute top-10 right-0 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[100px]">
                    <button onClick={() => { setOpen(false); onEdit() }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">수정하기</button>
                    <button onClick={() => { setOpen(false); onDelete() }} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50">삭제하기</button>
                </div>
            )}
        </li>
    )
}

function AdItemCard({
                        ad, onEdit, onDelete,
                    }: {
    ad: AdResponseDto
    onEdit: () => void
    onDelete: () => void
}) {
    const [open, setOpen] = useState(false)

    return (
        <li className="relative flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700">
            <div className="flex-1 pr-4 min-w-0">
                <div className="flex items-center gap-2">
                    {!ad.isActive && (
                        <span className="text-xs bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full shrink-0">비활성</span>
                    )}
                    <span className="font-medium truncate">{ad.title}</span>
                </div>
                {ad.linkUrl && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">{ad.linkUrl}</p>
                )}
            </div>
            <button onClick={() => setOpen((v) => !v)} className="text-gray-400 hover:text-gray-700 flex-shrink-0">
                <KebabIcon />
            </button>
            {open && (
                <div className="absolute top-10 right-0 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[100px]">
                    <button onClick={() => { setOpen(false); onEdit() }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">수정하기</button>
                    <button onClick={() => { setOpen(false); onDelete() }} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50">삭제하기</button>
                </div>
            )}
        </li>
    )
}

function ChevronLeftIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
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