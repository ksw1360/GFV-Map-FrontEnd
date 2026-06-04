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
    const [thumbnail, setThumbnail] = useState('');

    function handleAdd() {
        if (!name.trim()) return;
        onAdd({
            id: String(Date.now()),
            name,
            description,
            thumbnail: thumbnail || 'https://via.placeholder.com/150',
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
                    {/* 이미지 링크 */}
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">이미지 URL</label>
                        <input
                            type="text"
                            value={thumbnail}
                            onChange={(e) => setThumbnail(e.target.value)}
                            placeholder="https://..."
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-green-500"
                        />
                        {/* 미리보기 */}
                        {thumbnail && (
                            <div className="mt-2 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                                <img
                                    src={thumbnail}
                                    alt="미리보기"
                                    className="w-full h-full object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                            </div>
                        )}
                    </div>

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