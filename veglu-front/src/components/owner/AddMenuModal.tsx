'use client';

import { useState } from 'react';
import { Menu } from '@/components/owner/MenuCard';

export default function AddMenuModal({
                                         onClose,
                                         onAdd,
                                     }: {
    onClose: () => void;
    onAdd: (menu: Menu) => void;
}) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState('');

    function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
    }

    function handleAdd() {
        if (!name.trim()) return;
        onAdd({
            id: String(Date.now()),
            name,
            description,
            thumbnail: photoPreview || 'https://via.placeholder.com/150',
        });
        onClose();
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
                <h2 className="text-base font-semibold text-gray-900 mb-5">메뉴 추가</h2>

                <div className="flex flex-col gap-4">
                    {/* 사진 첨부 — 1:1 비율 */}
                    <label style={{ display: 'block', position: 'relative', paddingBottom: '100%', cursor: 'pointer' }}>
                        <div
                            style={{
                                position: 'absolute',
                                inset: 0,
                                borderRadius: '8px',
                                border: '1.5px dashed #d1d5db',
                                backgroundColor: '#f9fafb',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                            }}
                        >
                            {photoPreview ? (
                                <img
                                    src={photoPreview}
                                    alt="미리보기"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                                />
                            ) : (
                                <>
                                    <CameraIcon />
                                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>사진 첨부</span>
                                </>
                            )}
                        </div>
                        <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                    </label>

                    {/* 메뉴 이름 */}
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">메뉴 이름 *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="메뉴 이름을 입력하세요."
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-green-500"
                        />
                    </div>

                    {/* 메뉴 설명 */}
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">메뉴 설명</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="메뉴 설명을 입력하세요."
                            rows={3}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none resize-none focus:border-green-500 placeholder:text-gray-300"
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
                        onClick={handleAdd}
                        disabled={!name.trim()}
                        className="flex-1 py-2.5 text-sm font-medium text-white bg-green-700 rounded-xl hover:bg-green-800 disabled:opacity-40 transition-colors"
                    >
                        추가
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