'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { StoreCard } from '@/components/owner/StoreCard';
import { getMyRestaurants } from '@/libs/api/restaurant';

type Store = {
    restaurantId: number;
    name: string;
    thumbnail?: string;
};

export default function DashboardPage() {
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMyRestaurants()
            .then((data) => { console.log(data[0]); setStores(data); })
            .catch((e) => console.error('가게 목록 불러오기 실패', e))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="max-w-lg mx-auto px-5 py-6">
            <p className="text-sm text-gray-400 text-center">로딩 중...</p>
        </div>
    );

    return (
        <div className="max-w-lg mx-auto px-5 py-6">
            <h1 className="text-xl font-bold mb-6 text-gray-900">내 가게 목록</h1>
            {stores.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">등록된 가게가 없습니다.</p>
            ) : (
                <ul className="flex flex-col gap-4">
                    {stores.map((store) => (
                        <li key={store.restaurantId}>
                            <Link href={`/owner/store/${store.restaurantId}`}>
                                <StoreCard store={{
                                    id: String(store.restaurantId),
                                    name: store.name,
                                    thumbnail: store.thumbnail ?? '',
                                }} />
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}