'use client';

import { use, useState } from 'react';
import StoreTabs from '@/components/owner/StoreTabs';

export default function PhotoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [photos, setPhotos] = useState<string[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [url, setUrl] = useState('');

    function handleAdd() {
        if (!url.trim()) return;
        setPhotos((prev) => [...prev, url.trim()]);
        setUrl('');
        setShowModal(false);
    }

    function handleDelete(index: number) {
        setPhotos((prev) => prev.filter((_, i) => i !== index));
    }

    return (
        <div className="max-w-lg mx-auto">
            <StoreTabs storeId={id} />

            <div className="px-5 py-4">
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-gray-900">사진</h2>
                    <button
                        onClick={() => setShowModal(true)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 text-xl"
                    >
                        +
                    </button>
                </div>

                {/* 사진 그리드 */}
                {photos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center mt-24">
                        <p className="text-sm text-gray-400">등록된 사진이 없습니다.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                        {photos.map((src, i) => (
                            <div key={i} style={{ position: 'relative', paddingBottom: '100%' }}>
                                <img
                                    src={src}
                                    alt={`사진 ${i + 1}`}
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        borderRadius: '8px',
                                    }}
                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150'; }}
                                />
                                {/* 삭제 버튼 */}
                                <button
                                    onClick={() => handleDelete(i)}
                                    style={{
                                        position: 'absolute',
                                        top: '4px',
                                        right: '4px',
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        backgroundColor: 'rgba(0,0,0,0.5)',
                                        color: 'white',
                                        fontSize: '11px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: 'none',
                                        cursor: 'pointer',
                                        zIndex: 10,
                                    }}
                                    aria-label="사진 삭제"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* URL 입력 모달 */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
                    onClick={() => { setShowModal(false); setUrl(''); }}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 px-6 py-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-base font-semibold text-gray-900 mb-5">사진 추가</h2>

                        <label className="text-xs text-gray-500 mb-1 block">이미지 URL</label>
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-green-500"
                            autoFocus
                            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
                        />

                        {url && (
                            <div style={{
                                marginTop: '12px',
                                width: '100%',
                                paddingBottom: '100%',
                                position: 'relative',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                backgroundColor: '#f3f4f6',
                            }}>
                                <img
                                    src={url}
                                    alt="미리보기"
                                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                            </div>
                        )}

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => { setShowModal(false); setUrl(''); }}
                                className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleAdd}
                                disabled={!url.trim()}
                                className="flex-1 py-2.5 text-sm font-medium text-white bg-green-700 rounded-xl hover:bg-green-800 disabled:opacity-40 transition-colors"
                            >
                                추가
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}