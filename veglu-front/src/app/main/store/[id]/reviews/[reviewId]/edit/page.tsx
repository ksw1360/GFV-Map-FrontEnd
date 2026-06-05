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

const DUMMY_REVIEW = {
    storeName: '낭만모로코',
    rating: 4,
    selectedTags: ['음식이 맛있어요'],
    photos: [] as { file: File | null; preview: string }[],
    content: '음식이 정말 맛있었어요.',
};

const MAX_PHOTOS = 5;

export default function ReviewEditPage({
                                           params,
                                       }: {
    params: Promise<{ id: string; reviewId: string }>;
}) {
    const { id, reviewId } = use(params);
    const router = useRouter();

    const [rating, setRating] = useState(DUMMY_REVIEW.rating);
    const [selectedTags, setSelectedTags] = useState<string[]>(DUMMY_REVIEW.selectedTags);
    const [photos, setPhotos] = useState<{ file: File | null; preview: string }[]>(DUMMY_REVIEW.photos);
    const [content, setContent] = useState(DUMMY_REVIEW.content);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

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

    function handleEdit() {
        if (!content.trim()) return;
        router.back();
    }

    function handleDelete() {
        router.back();
    }

    return (
        <div className="max-w-lg mx-auto px-5 py-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">{DUMMY_REVIEW.storeName}</h1>

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

                    {photos.length < MAX_PHOTOS && (
                        <label style={{ paddingBottom: '100%', position: 'relative', cursor: 'pointer' }}>
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

            <div className="flex justify-end gap-3">
                <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-6 py-2.5 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors"
                >
                    삭제하기
                </button>
                <button
                    onClick={handleEdit}
                    disabled={!content.trim()}
                    className="px-6 py-2.5 text-sm font-medium text-white bg-green-700 rounded-xl hover:bg-green-800 disabled:opacity-40 transition-colors"
                >
                    수정하기
                </button>
            </div>

            {showDeleteModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
                    onClick={() => setShowDeleteModal(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl px-8 py-6 w-[280px] flex flex-col items-center gap-5"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <p className="text-sm font-medium text-gray-800">리뷰를 삭제하시겠습니까?</p>
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                아니요
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 py-2.5 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors"
                            >
                                예
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
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
        </svg>
    );
}