'use client';

import { useState } from 'react';
import StoreListCard from '@/components/admin/StoreListCard';

const DUMMY_STORES = [
    {
        id: '1',
        name: '낭만모로코',
        thumbnail: 'https://i.pinimg.com/736x/bf/c5/64/bfc56449fe1871d5cf1afacfdac52456.jpg',
        registeredAt: '2026.05.29',
        address: '위치: 서울특별시 관악구 관악로14길 88',
        description: '주요 메뉴: 카프레제 샐러드, 쿠스쿠스 샐러드 등',
    },
    {
        id: '2',
        name: '낭만모로코',
        thumbnail: 'https://i.pinimg.com/736x/bf/c5/64/bfc56449fe1871d5cf1afacfdac52456.jpg',
        registeredAt: '2026.05.29',
        address: '위치: 서울특별시 관악구 관악로14길 88',
        description: '주요 메뉴: 카프레제 샐러드, 쿠스쿠스 샐러드 등',
    },
    {
        id: '3',
        name: '세인트마리',
        thumbnail: 'https://i.pinimg.com/736x/bf/c5/64/bfc56449fe1871d5cf1afacfdac52456.jpg',
        registeredAt: '2026.05.29',
        address: '위치: 서울특별시 관악구 관악로14길 88',
        description: '주요 메뉴: 카프레제 샐러드, 쿠스쿠스 샐러드 등',
    },
];

export default function StoresPage() {
    const [search, setSearch] = useState('');

    const filtered = DUMMY_STORES.filter((store) =>
        store.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-lg mx-auto px-5 py-6">
            {/* 검색바 */}
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 mb-4">
                <SearchIcon />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="가게 이름 검색"
                    className="flex-1 text-sm outline-none placeholder:text-gray-300"
                />
                {search && (
                    <button onClick={() => setSearch('')} className="text-gray-300 hover:text-gray-500">
                        <ClearIcon />
                    </button>
                )}
            </div>

            {/* 가게 목록 */}
            <ul className="flex flex-col gap-3">
                {filtered.length > 0 ? (
                    filtered.map((store) => (
                        <li key={store.id}>
                            <StoreListCard store={store} />
                        </li>
                    ))
                ) : (
                    <p className="text-sm text-gray-400 text-center py-10">검색 결과가 없습니다.</p>
                )}
            </ul>
        </div>
    );
}

function SearchIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
    );
}

function ClearIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
    );
}