'use client';

import { useState, use, useEffect } from 'react';
import StoreTabs from '@/components/owner/StoreTabs';
import EditStoreModal from '@/components/owner/EditStoreModal';
import { getRestaurant, updateRestaurant } from '@/libs/api/restaurant';

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

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex gap-2 text-xs text-gray-600">
            {label && (
                <span className="text-gray-400 w-20 flex-shrink-0 whitespace-nowrap">
                    {label}
                </span>
            )}
            <span>{value}</span>
        </div>
    );
}

function StarIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#f5a623" stroke="none">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
    );
}

export default function StoreHomePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [store, setStore] = useState<Store | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        getRestaurant(Number(id))
            .then((data) => setStore({
                id: String(data.restaurant_id),
                name: data.name,
                rating: data.avgRating ?? 0,
                hours: data.businessHours ? Object.values(data.businessHours)[0] as string : '',
                breakTime: '',
                phone: data.phone ?? '',
                address: data.address ?? '',
                thumbnail: '',
            }))
            .catch((e) => console.error('가게 정보 불러오기 실패', e))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <div className="max-w-lg mx-auto">
            <StoreTabs storeId={id} />
            <p className="text-center text-sm text-gray-400 py-10">로딩 중...</p>
        </div>
    );

    if (!store) return (
        <div className="p-10 text-center">가게 정보를 찾을 수 없습니다.</div>
    );

    return (
        <div className="max-w-lg mx-auto">
            <StoreTabs storeId={id} />

            <div className="px-5 py-5">
                <div className="flex gap-4">
                    <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                        {store.thumbnail && (
                            <img src={store.thumbnail} alt={store.name} className="w-full h-full object-cover" />
                        )}
                    </div>

                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-lg font-semibold text-gray-900">{store.name}</h1>
                            <span className="flex items-center gap-1 text-sm text-gray-500">
                                <StarIcon />
                                {store.rating}
                            </span>
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="text-sm text-green-600 underline underline-offset-2"
                            >
                                수정하기
                            </button>
                        </div>
                        <InfoRow label="영업" value={store.hours} />
                        <InfoRow label="브레이크타임" value={store.breakTime} />
                        <InfoRow label="전화" value={store.phone} />
                        <InfoRow label="위치" value={store.address} />
                    </div>
                </div>
            </div>

            {isEditModalOpen && (
                <EditStoreModal
                    store={store}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={async (updatedStore) => {
                        await updateRestaurant(Number(id), {
                            name: updatedStore.name,
                            phone: updatedStore.phone,
                            address: updatedStore.address,
                        });
                        setStore((prev) => prev ? { ...prev, ...updatedStore } : prev);
                        setIsEditModalOpen(false);
                    }}
                />
            )}
        </div>
    );
}