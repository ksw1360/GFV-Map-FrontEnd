'use client';

import { useState } from 'react';

type Store = {
    id: string;
    name: string;
    rating: number;
    hours: string;
    breakTime: string;
    phone: string;
    address: string;
    thumbnail: string;
};

export default function EditStoreModal({
                                           store,
                                           onClose,
                                           onSave,
                                       }: {
    store: Store;
    onClose: () => void;
    onSave: (updated: Partial<Store>) => void;
}) {
    const [name, setName] = useState(store.name);
    const [hours, setHours] = useState(store.hours);
    const [breakTime, setBreakTime] = useState(store.breakTime);
    const [phone, setPhone] = useState(store.phone);
    const [address, setAddress] = useState(store.address);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState(store.thumbnail);

    function filterTimeInput(value: string) {
        return value.replace(/[^0-9:~\-\s]/g, '');
    }

    function filterPhoneInput(value: string) {
        return value.replace(/[^0-9\-]/g, '');
    }

    function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
    }

    function handleSave() {
        onSave({ name, hours, breakTime, phone, address, thumbnail: photoPreview });
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 px-6 py-6 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-base font-semibold text-gray-900 mb-5">가게 정보 수정</h2>

                <div className="flex flex-col gap-4">
                    {/* 사진 */}
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">가게 사진</label>
                        <label className="block cursor-pointer">
                            <div style={{ position: 'relative', paddingBottom: '100%' }} className="mb-2">
                                <div
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        border: '1px solid #e5e7eb',
                                        backgroundColor: '#f9fafb',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                    }}
                                >
                                    {photoPreview ? (
                                        <img src={photoPreview} alt="가게 사진" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <>
                                            <CameraIcon />
                                            <p className="text-xs text-gray-400">사진 첨부</p>
                                        </>
                                    )}
                                </div>
                            </div>
                            <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
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
                    {/* 가게 이름 */}
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">가게 이름</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-green-500"
                        />
                    </div>

                    {/* 영업시간 */}
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">영업시간</label>
                        <input
                            type="text"
                            value={hours}
                            onChange={(e) => setHours(filterTimeInput(e.target.value))}
                            placeholder="예: 10:00 - 22:00"
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-green-500"
                        />
                    </div>

                    {/* 브레이크타임 */}
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">브레이크타임</label>
                        <input
                            type="text"
                            value={breakTime}
                            onChange={(e) => setBreakTime(filterTimeInput(e.target.value))}
                            placeholder="예: 15:00 - 17:00"
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-green-500"
                        />
                    </div>

                    {/* 전화번호 */}
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">전화번호</label>
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(filterPhoneInput(e.target.value))}
                            placeholder="예: 02-123-4567"
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-green-500"
                        />
                    </div>

                    {/* 주소 */}
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">주소</label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-green-500"
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
                        onClick={handleSave}
                        className="flex-1 py-2.5 text-sm font-medium text-white bg-green-700 rounded-xl hover:bg-green-800 transition-colors"
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