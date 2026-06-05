'use client';

import { use, useState } from 'react';
import StoreTabs from '@/components/owner/StoreTabs';

export default function PhotoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [photos, setPhotos] = useState<{ preview: string }[]>([]);

    function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        const toAdd = files.map((file) => ({
            preview: URL.createObjectURL(file),
        }));
        setPhotos((prev) => [...prev, ...toAdd]);
        e.target.value = '';
    }

    function handleDelete(index: number) {
        setPhotos((prev) => prev.filter((_, i) => i !== index));
    }

    return (
        <div className="max-w-lg mx-auto">
            <StoreTabs storeId={id} />

            <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-gray-900">사진</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                    {/* 기존 사진들 */}
                    {photos.map((photo, i) => (
                        <div key={i} style={{ position: 'relative', paddingBottom: '100%' }}>
                            <img
                                src={photo.preview}
                                alt={`사진 ${i + 1}`}
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                }}
                            />
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
                            >
                                ✕
                            </button>
                        </div>
                    ))}

                    {/* 추가 버튼 — 항상 표시 */}
                    <label style={{ position: 'relative', paddingBottom: '100%', cursor: 'pointer' }}>
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
                                gap: '4px',
                            }}
                        >
                            <CameraIcon />
                            <span style={{ fontSize: '10px', color: '#9ca3af' }}>
                {photos.length}장
              </span>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handlePhotoChange}
                            className="hidden"
                        />
                    </label>
                </div>

                {photos.length === 0 && (
                    <div className="flex flex-col items-center justify-center mt-16">
                        <p className="text-sm text-gray-400">등록된 사진이 없습니다.</p>
                    </div>
                )}
            </div>
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