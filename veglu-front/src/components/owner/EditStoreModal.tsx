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

    // 숫자·기호만 허용 (문자 입력 차단)
    function filterTimeInput(value: string) {
        return value.replace(/[^0-9:~\-\s]/g, '');
    }

    function filterPhoneInput(value: string) {
        return value.replace(/[^0-9\-]/g, '');
    }

    function handleSave() {
        onSave({ name, hours, breakTime, phone, address });
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
                <h2 className="text-base font-semibold text-gray-900 mb-5">가게 정보 수정</h2>

                <div className="flex flex-col gap-4">
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