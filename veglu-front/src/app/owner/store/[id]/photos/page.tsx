'use client';

import { use, useState, useEffect } from 'react';
import StoreTabs from '@/components/owner/StoreTabs';
import { getPhotos, createPhoto, deletePhoto } from '@/libs/api/photo';

type Photo = {
    photoId: number;
    url: string;
    caption?: string;
};

export default function PhotoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

    useEffect(() => {
        getPhotos(Number(id))
            .then((data: Photo[]) => setPhotos(data))
            .catch((e) => console.error('사진 불러오기 실패', e))
            .finally(() => setLoading(false));
    }, [id]);

    async function handleAdd() {
        if (!urlInput.trim()) return;
        try {
            const created = await createPhoto({
                url: urlInput.trim(),
                type: 'RESTAURANT',
                restaurantId: Number(id),
                // caption 제거
            });
            setPhotos((prev) => [...prev, created]);
            setUrlInput('');
            setShowAddModal(false);
        } catch (e) {
            console.error('사진 추가 실패', e);
        }
    }

    async function handleDelete(photoId: number) {
        try {
            await deletePhoto(photoId);
            setPhotos((prev) => prev.filter((p) => p.photoId !== photoId));
        } catch (e) {
            console.error('사진 삭제 실패', e);
        }
        setDeleteTarget(null);
    }

    if (loading) return (
        <div className="max-w-lg mx-auto">
            <StoreTabs storeId={id} />
            <p className="text-center text-sm text-gray-400 py-10">로딩 중...</p>
        </div>
    );

    return (
        <div className="max-w-lg mx-auto">
            <StoreTabs storeId={id} />

            <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-gray-900">사진</h2>
                </div>

                {photos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center mt-16 gap-3">
                        <p className="text-sm text-gray-400">등록된 사진이 없습니다.</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="text-sm text-blue-500 underline"
                        >
                            사진 추가하기
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                        {photos.map((photo) => (
                            <div key={photo.photoId} style={{ position: 'relative', paddingBottom: '100%' }}>
                                <img
                                    src={photo.url || '/default-image.png'}
                                    alt={photo.caption ?? '사진'}
                                    style={{
                                        position: 'absolute', inset: 0,
                                        width: '100%', height: '100%',
                                        objectFit: 'cover', borderRadius: '8px',
                                    }}
                                />
                                <button
                                    onClick={() => setDeleteTarget(photo.photoId)}
                                    style={{
                                        position: 'absolute', top: '4px', right: '4px',
                                        width: '20px', height: '20px', borderRadius: '50%',
                                        backgroundColor: 'rgba(0,0,0,0.5)', color: 'white',
                                        fontSize: '11px', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        border: 'none', cursor: 'pointer', zIndex: 10,
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}

                        <button
                            onClick={() => setShowAddModal(true)}
                            style={{
                                position: 'relative', paddingBottom: '100%',
                                cursor: 'pointer', background: 'none', border: 'none', padding: 0,
                            }}
                        >
                            <div style={{
                                position: 'absolute', inset: 0, borderRadius: '8px',
                                border: '1.5px dashed #d1d5db', backgroundColor: '#f9fafb',
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center', gap: '4px',
                            }}>
                                <CameraIcon />
                                <span style={{ fontSize: '10px', color: '#9ca3af' }}>{photos.length}장</span>
                            </div>
                        </button>
                    </div>
                )}
            </div>

            {/* URL 입력 모달 */}
            {showAddModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
                    onClick={() => setShowAddModal(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 px-6 py-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-base font-semibold text-gray-900 mb-4">사진 추가</h2>
                        <div className="flex flex-col gap-3">
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">이미지 URL *</label>
                                <input
                                    type="text"
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-green-500"
                                />
                            </div>
                            {urlInput && (
                                <img
                                    src={urlInput}
                                    alt="미리보기"
                                    className="w-full h-40 object-cover rounded-xl border border-gray-100"
                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                />
                            )}
                        </div>
                        <div className="flex gap-3 mt-5">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleAdd}
                                disabled={!urlInput.trim()}
                                className="flex-1 py-2.5 text-sm font-medium text-white bg-green-700 rounded-xl hover:bg-green-800 disabled:opacity-40"
                            >
                                추가
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 삭제 확인 모달 */}
            {deleteTarget !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
                    <div className="bg-white rounded-2xl shadow-xl px-8 py-6 w-[280px] flex flex-col items-center gap-5">
                        <p className="text-sm font-medium text-gray-800">사진을 삭제하시겠어요?</p>
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200"
                            >
                                아니요
                            </button>
                            <button
                                onClick={() => handleDelete(deleteTarget)}
                                className="flex-1 py-2.5 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600"
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

function CameraIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
        </svg>
    );
}