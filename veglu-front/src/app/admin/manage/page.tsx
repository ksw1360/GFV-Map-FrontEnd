'use client';

import { useState } from 'react';

type Notice = {
    id: string;
    content: string;
};

type Ad = {
    id: string;
    content: string;
};

type Mode =
    | null
    | { type: 'notice' | 'ad'; action: 'create' }
    | { type: 'notice' | 'ad'; action: 'edit'; id: string };

const DUMMY_NOTICES: Notice[] = [
    { id: '1', content: '리뷰 신고 기능이 추가되었습니다.' },
    { id: '2', content: '5/30 새벽 4시 점검 예정, 이용에 불편을 드려서 죄송합니다.' },
];

const DUMMY_ADS: Ad[] = [
    { id: '1', content: '오늘 인기 식당 TOP10' },
    { id: '2', content: '채식메뉴 인기' },
];

const MAX = 400;

export default function ManagePage() {
    const [notices, setNotices] = useState<Notice[]>(DUMMY_NOTICES);
    const [ads, setAds] = useState<Ad[]>(DUMMY_ADS);
    const [mode, setMode] = useState<Mode>(null);
    const [text, setText] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ type: 'notice' | 'ad'; id: string } | null>(null);

    function openCreate(type: 'notice' | 'ad') {
        setText('');
        setMode({ type, action: 'create' });
    }

    function openEdit(type: 'notice' | 'ad', id: string, content: string) {
        setText(content);
        setMode({ type, action: 'edit', id });
    }

    function handleConfirm() {
        if (!text.trim() || !mode) return;

        if (mode.action === 'create') {
            if (mode.type === 'notice') {
                setNotices((prev) => [...prev, { id: String(Date.now()), content: text }]);
            } else {
                setAds((prev) => [...prev, { id: String(Date.now()), content: text }]);
            }
        } else if (mode.action === 'edit') {
            if (mode.type === 'notice') {
                setNotices((prev) => prev.map((n) => n.id === mode.id ? { ...n, content: text } : n));
            } else {
                setAds((prev) => prev.map((a) => a.id === mode.id ? { ...a, content: text } : a));
            }
        }

        setText('');
        setMode(null);
    }

    function handleDelete(type: 'notice' | 'ad', id: string) {
        if (type === 'notice') {
            setNotices((prev) => prev.filter((n) => n.id !== id));
        } else {
            setAds((prev) => prev.filter((a) => a.id !== id));
        }
        setShowDeleteConfirm(null);
    }

    // 작성/수정 화면
    if (mode) {
        const isEdit = mode.action === 'edit';
        const title = mode.type === 'notice' ? '공지사항' : '광고';

        return (
            <div className="max-w-lg mx-auto px-5 py-6">
                {/* 뒤로가기 */}
                <button
                    onClick={() => { setText(''); setMode(null); }}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors"
                >
                    <ChevronLeftIcon />
                    뒤로가기
                </button>

                <h2 className="text-base font-semibold text-gray-900 mb-4">
                    {title} {isEdit ? '수정' : '작성'}
                </h2>

                <div className="border border-gray-200 rounded-xl overflow-hidden">
          <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX))}
              placeholder="내용을 입력하세요."
              className="w-full px-4 py-3 text-sm text-gray-700 resize-none outline-none placeholder:text-gray-300 min-h-[200px]"
              autoFocus
          />
                    <div className="flex justify-end px-4 py-2 text-xs text-gray-400 border-t border-gray-100">
                        {text.length}/{MAX}
                    </div>
                </div>

                <div className="flex justify-end mt-4">
                    <button
                        onClick={handleConfirm}
                        disabled={!text.trim()}
                        className="px-6 py-2.5 text-sm font-medium text-white bg-green-700 rounded-full hover:bg-green-800 disabled:opacity-40 transition-colors"
                    >
                        {isEdit ? '수정완료' : '작성완료'}
                    </button>
                </div>
            </div>
        );
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
                <ul className="flex flex-col gap-2">
                    {notices.map((notice) => (
                        <ItemCard
                            key={notice.id}
                            content={notice.content}
                            onEdit={() => openEdit('notice', notice.id, notice.content)}
                            onDelete={() => setShowDeleteConfirm({ type: 'notice', id: notice.id })}
                        />
                    ))}
                </ul>
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
                <ul className="flex flex-col gap-2">
                    {ads.map((ad) => (
                        <ItemCard
                            key={ad.id}
                            content={ad.content}
                            onEdit={() => openEdit('ad', ad.id, ad.content)}
                            onDelete={() => setShowDeleteConfirm({ type: 'ad', id: ad.id })}
                        />
                    ))}
                </ul>
            </div>

            {/* 삭제 확인 모달 */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
                    <div className="bg-white rounded-2xl shadow-xl px-6 py-5 w-full max-w-xs mx-4">
                        <p className="text-sm text-gray-700 text-center mb-5">삭제하시겠어요?</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                아니요
                            </button>
                            <button
                                onClick={() => handleDelete(showDeleteConfirm.type, showDeleteConfirm.id)}
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

function ItemCard({
                      content,
                      onEdit,
                      onDelete,
                  }: {
    content: string;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const [open, setOpen] = useState(false);

    return (
        <li className="relative flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700">
            <span className="flex-1 pr-4">{content}</span>
            <button
                onClick={() => setOpen((v) => !v)}
                className="text-gray-400 hover:text-gray-700 flex-shrink-0"
            >
                <KebabIcon />
            </button>

            {open && (
                <div
                    className="absolute top-10 right-0 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[100px]"
                    onBlur={() => setOpen(false)}
                >
                    <button
                        onClick={() => { setOpen(false); onEdit(); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                        수정하기
                    </button>
                    <button
                        onClick={() => { setOpen(false); onDelete(); }}
                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50"
                    >
                        삭제하기
                    </button>
                </div>
            )}
        </li>
    );
}

// ── 아이콘 ────────────────────────────────────────────
function ChevronLeftIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
        </svg>
    );
}

function KebabIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="1.5"/>
            <circle cx="12" cy="12" r="1.5"/>
            <circle cx="12" cy="19" r="1.5"/>
        </svg>
    );
}