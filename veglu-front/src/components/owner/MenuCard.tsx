'use client';

import { useState } from 'react';

export type Menu = {
    id: string;
    restaurantId: number;
    name: string;
    description: string;
    thumbnail: string;
};

type Props = {
    menu: Menu;
    onDelete: (id: string) => void;
    onEdit: (menu: Menu) => void;
};

export default function MenuCard({ menu, onDelete, onEdit }: Props) {
    const [open, setOpen] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    return (
        <>
            <li className="flex gap-4 py-4 relative">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                    {menu.thumbnail ? (
                        <img src={menu.thumbnail} alt={menu.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            이미지 없음
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-900">{menu.name}</p>
                        <div className="relative flex-shrink-0">
                            <button
                                onClick={() => setOpen(!open)}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"
                            >
                                <KebabIcon />
                            </button>

                            {open && (
                                <div className="absolute right-0 top-9 w-28 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden py-1">
                                    <button
                                        className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50"
                                        onClick={() => { setOpen(false); setShowEditModal(true); }}
                                    >
                                        수정하기
                                    </button>
                                    <button
                                        className="w-full px-4 py-2 text-sm text-left text-red-500 hover:bg-red-50"
                                        onClick={() => { setOpen(false); setShowDeleteModal(true); }}
                                    >
                                        삭제하기
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mt-1">
                        {menu.description}
                    </p>
                </div>
            </li>

            {/* 수정 모달 */}
            {showEditModal && (
                <EditMenuModal
                    menu={menu}
                    onClose={() => setShowEditModal(false)}
                    onSave={(updated) => { onEdit(updated); setShowEditModal(false); }}
                />
            )}

            {/* 삭제 확인 모달 */}
            {showDeleteModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
                    onClick={() => setShowDeleteModal(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl px-8 py-6 w-[280px] flex flex-col items-center gap-5"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <p className="text-sm font-medium text-gray-800">메뉴를 삭제하시겠어요?</p>
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                아니요
                            </button>
                            <button
                                onClick={() => { onDelete(menu.id); setShowDeleteModal(false); }}
                                className="flex-1 py-2.5 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors"
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// ── 수정 모달 ──────────────────────────────────────────
function EditMenuModal({
                           menu,
                           onClose,
                           onSave,
                       }: {
    menu: Menu;
    onClose: () => void;
    onSave: (updated: Menu) => void;
}) {
    const [name, setName] = useState(menu.name);
    const [description, setDescription] = useState(menu.description);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState(menu.thumbnail);

    function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 px-6 py-6"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-base font-semibold text-gray-900 mb-5">메뉴 수정</h2>

                <div className="flex flex-col gap-4">
                    {/* 사진 첨부 */}
                    <div>
                        <label className="block cursor-pointer">
                            <div className="w-full h-32 border border-gray-200 rounded-xl flex items-center justify-center bg-gray-50 mb-2 overflow-hidden hover:bg-gray-100 transition-colors">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="미리보기" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-gray-400">
                                        <CameraIcon />
                                        <p className="text-xs">사진 첨부</p>
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                className="hidden"
                            />
                        </label>
                        {photoPreview && (
                            <button
                                onClick={() => { setPhotoFile(null); setPhotoPreview(''); }}
                                className="text-xs text-red-400 hover:text-red-600"
                            >
                                사진 삭제
                            </button>
                        )}
                    </div>

                    {/* 메뉴 이름 */}
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">메뉴 이름 *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-green-500"
                        />
                    </div>

                    {/* 메뉴 설명 */}
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">메뉴 설명</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none resize-none focus:border-green-500"
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        취소
                    </button>
                    <button
                        onClick={() => onSave({ ...menu, name, description, thumbnail: photoPreview })}
                        disabled={!name.trim()}
                        className="flex-1 py-2.5 text-sm font-medium text-white bg-green-700 rounded-xl hover:bg-green-800 disabled:opacity-40 transition-colors"
                    >
                        저장
                    </button>
                </div>
            </div>
        </div>
    );
}

function CameraIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
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