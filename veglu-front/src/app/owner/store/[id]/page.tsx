'use client';

import { useState, use } from 'react';
import StoreTabs from '@/components/owner/StoreTabs';
import EditStoreModal from '@/components/owner/EditStoreModal';

const STORES_DB = [
    {
        id: '1',
        name: '낭만모로코',
        rating: 4.7,
        hours: '10:00 - 22:00',
        breakTime: '15:00 - 17:00',
        phone: '02-123-4567',
        address: '서울특별시 관악구 관악로14길 88',
        thumbnail:
            'https://i.pinimg.com/736x/bf/c5/64/bfc56449fe1871d5cf1afacfdac52456.jpg',
    },
];

function InfoRow({
                     label,
                     value,
                 }: {
    label: string;
    value: string;
}) {
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
        <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="#f5a623"
            stroke="none"
        >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
    );
}

export default function StoreHomePage({
                                          params,
                                      }: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const initialStore = STORES_DB.find((s) => s.id === id);

    const [store, setStore] = useState(
        initialStore ?? STORES_DB[0]
    );

    if (!initialStore) {
        return (
            <div className="p-10 text-center">
                가게 정보를 찾을 수 없습니다.
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto">
            <StoreTabs storeId={id} />

            <div className="px-5 py-5">
                <div className="flex gap-4">
                    <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                        <img
                            src={store.thumbnail}
                            alt={store.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-lg font-semibold text-gray-900">
                                {store.name}
                            </h1>

                            <span className="flex items-center gap-1 text-sm text-gray-500">
                                <StarIcon />
                                {store.rating}
                            </span>

                            <button
                                onClick={() =>
                                    setIsEditModalOpen(true)
                                }
                                className="text-sm text-green-600 underline underline-offset-2"
                            >
                                수정하기
                            </button>
                        </div>

                        <InfoRow
                            label="영업"
                            value={store.hours}
                        />

                        <InfoRow
                            label="브레이크타임"
                            value={store.breakTime}
                        />

                        <InfoRow
                            label="전화"
                            value={store.phone}
                        />

                        <InfoRow
                            label="위치"
                            value={store.address}
                        />

                    </div>
                </div>
            </div>

            {isEditModalOpen && (
                <EditStoreModal
                    store={store}
                    onClose={() =>
                        setIsEditModalOpen(false)
                    }
                    onSave={(updatedStore) => {
                        setStore({
                            ...store,
                            ...updatedStore,
                        });

                        setIsEditModalOpen(false);
                    }}
                />
            )}
        </div>
    );
}