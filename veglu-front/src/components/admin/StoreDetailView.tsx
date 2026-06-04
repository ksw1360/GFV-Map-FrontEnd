'use client';

import { useState } from 'react';

type Menu = {
    id: string;
    name: string;
    description: string;
    thumbnail: string;
};

type Store = {
    id: string;
    name: string;
    rating: number;
    hours: string;
    breakTime: string;
    phone: string;
    address: string;
    thumbnail: string;
    isPendingApproval: boolean;
    menus: Menu[];
};

export default function StoreDetailView({ store }: { store: Store }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="px-5 py-5">
            <div className="flex gap-4 mb-6">
                <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                    <img src={store.thumbnail} alt={store.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-lg font-semibold text-gray-900">{store.name}</h1>
                                <span className="flex items-center gap-1 text-sm text-gray-500">
                                    <StarIcon /> {store.rating}
                                </span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <InfoRow label="영업" value={store.hours} />
                                <InfoRow label="" value={store.breakTime} />
                                <InfoRow label="전화" value={store.phone} />
                                <p className="text-xs text-gray-500 leading-relaxed mt-1">{store.address}</p>
                            </div>
                        </div>

                        {store.isPendingApproval && (
                            <div className="relative">
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="p-1 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
                                >
                                    <EllipsisIcon />
                                </button>
                                {isMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-28 bg-white border border-gray-100 rounded-lg shadow-lg z-20 py-1">
                                        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">수정요구</button>
                                        <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">삭제</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="w-full">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">메뉴</h2>
                <div className="flex flex-col gap-4">
                    {store.menus.map((menu) => (
                        <div key={menu.id} className="flex gap-3">
                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                                <img src={menu.thumbnail} alt={menu.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col justify-center min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">{menu.name}</p>
                                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{menu.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex gap-2 text-xs text-gray-600">
            {label && <span className="text-gray-400 w-6 flex-shrink-0">{label}</span>}
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

function EllipsisIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
        </svg>
    );
}