'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import StarInput from '@/components/review/StarInput';

const TAGS = [
    '음식이 맛있어요',
    '친절해요',
    '분위기가 좋아요',
    '가격이 합리적이에요',
    '또 방문하고 싶어요',
    '청결해요',
    '비건 메뉴가 다양해요',
    '글루텐프리 옵션이 있어요',
];

const STORE_NAME = '낭만모로코';
const MAX_PHOTOS = 5;

export default function ReviewWritePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [rating, setRating] = useState(0);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
    const [content, setContent] = useState('');

    function toggleTag(tag: string) {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    }

    function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        const remaining = MAX_PHOTOS - photos.length;
        const toAdd = files.slice(0, remaining).map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        setPhotos((prev) => [...prev, ...toAdd]);
        e.target.value = '';
    }

    function handleDeletePhoto(index: number) {
        setPhotos((prev) => prev.filter((_, i) => i !== index));
    }

    function handleSubmit() {
        if (!content.trim()) return;
        router.back();
    }

    return (
        <div className="max-w-lg mx-auto px-5 py-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">{STORE_NAME}</h1>

            <div className="mb-6">
                <StarInput rating={rating} onChange={setRating} />
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
                {TAGS.map((tag, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-4 py-2 text-xs rounded-full border transition-colors whitespace-nowrap ${
                            selectedTags.includes(tag)
                                ? 'bg-green-700 text-white border-green-700'
                                : 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100'
                        }`}
                    >
                        {tag}
                    </button>
                ))}
            </div>

            {/* 사진 첨부 */}
            <div className="mb-6">
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        gap: '6px',
                    }}
                >
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
                                onClick={() => handleDeletePhoto(i)}
                                style={{
                                    position: 'absolute',
                                    top: '3px',
                                    right: '3px',
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                    color: 'white',
                                    fontSize: '10px',
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

                    {/* 추가 버튼 (5장 미만일 때만) */}
                    {photos.length < MAX_PHOTOS && (
                        <label
                            style={{ paddingBottom: '100%', position: 'relative', cursor: 'pointer' }}
                        >
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
                  {photos.length}/{MAX_PHOTOS}
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
                    )}
                </div>
            </div>

            <div className="mb-6">
                <div className="border border-gray-200 rounded-xl overflow-hidden">
          <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 500))}
              placeholder="내용을 입력하세요."
              rows={5}
              className="w-full px-4 py-3 text-sm text-gray-700 resize-none outline-none placeholder:text-gray-300"
          />
                    <div className="flex justify-end px-4 py-2 border-t border-gray-100 text-xs text-gray-400">
                        {content.length}/500
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={!content.trim()}
                    className="px-6 py-2.5 text-sm font-medium text-white bg-green-700 rounded-xl hover:bg-green-800 disabled:opacity-40 transition-colors"
                >
                    작성완료
                </button>
            </div>
        </div>
    );
}

function CameraIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
        </svg>
    );
}