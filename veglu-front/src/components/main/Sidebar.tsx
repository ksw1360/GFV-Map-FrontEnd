'use client';

import React, { useState } from 'react';

interface Restaurant {
    restaurantId: number;
    name: string;
    address: string;
    points: string;
    matchedMenus: string[];
    veganType: string;
}

interface SidebarProps {
    restaurants: Restaurant[];
    selectedId: number | null;
    onShopSelect: (id: number) => void;
}

export default function Sidebar({ restaurants, selectedId, onShopSelect }: SidebarProps) {
    const [isOpen, setIsOpen] = useState(true);
    const [sortRule, setSortRule] = useState('distance');

    const processedList = [...restaurants].sort((a, b) => {
        if (sortRule === 'rating') {
            return (b.rating || 0) - (a.rating || 0);
        }
        return a.restaurantId - b.restaurantId; // id에서 restaurantId 순 정렬로 싱크 매칭
    });

    return (
        <div className="relative flex h-full z-10 pointer-events-none">
            <div
                className={`bg-white border-r border-gray-200 h-full flex flex-col transition-all duration-300 pointer-events-auto ${
                    isOpen ? 'w-[360px]' : 'w-0 overflow-hidden border-r-0'
                }`}
            >
                {/* 상단 정렬 바 */}
                <div className="p-4 border-b border-gray-100">
                    <select
                        value={sortRule}
                        onChange={(e) => setSortRule(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 focus:outline-none cursor-pointer"
                    >
                        <option value="distance">거리순 정렬 (F-SEARCH-003)</option>
                        <option value="rating">평점순 정렬</option>
                    </select>
                </div>

                {/* 식당 카드 리스트 영역 */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {processedList.map((shop) => (
                        <div
                            key={shop.restaurantId} // 💡 고유식별자 교체
                            onClick={() => onShopSelect(shop.restaurantId)}
                            className={`p-4 border rounded-2xl bg-white transition-all cursor-pointer hover:border-green-600 hover:shadow-sm ${
                                selectedId === shop.restaurantId
                                    ? 'border-green-600 ring-2 ring-green-600/10 bg-green-50/20'
                                    : 'border-gray-200'
                            }`}
                        >
                            <div className="flex space-x-3">
                                <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center text-xs text-gray-400 flex-shrink-0">
                                    사진
                                </div>
                                <div className="space-y-1 overflow-hidden w-full">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-sm text-gray-900 truncate max-w-[180px]">{shop.name}</h3>
                                        {/* 💡 백엔드가 전송해 준 비건 등급 배지 노출 */}
                                        <span className="text-[9px] bg-green-100 text-green-800 font-extrabold px-1.5 py-0.5 rounded-md flex-shrink-0">
                                            {shop.veganType}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">{shop.address}</p>

                                    {/* 💡 검색한 메뉴명이 발견되었을 때의 요약 오버레이 처리 */}
                                    {shop.matchedMenus && shop.matchedMenus.length > 0 && (
                                        <p className="text-[10px] text-gray-400 truncate pt-0.5">
                                            🔍 관련 메뉴: <span className="text-gray-600 font-medium">{shop.matchedMenus.join(', ')}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {processedList.length === 0 && (
                        <div className="text-center py-20 text-xs text-gray-400">
                            검색 조건에 맞는 매장이 없습니다.
                        </div>
                    )}
                </div>
            </div>

            {/* 접기/펴기 토글 버튼 */}
            <div className="flex items-center h-full pointer-events-auto">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 p-2 rounded-r-xl shadow-md transition-all -ml-[1px]"
                    title={isOpen ? '사이드바 접기' : '사이드바 열기'}
                >
                    {isOpen ? '◀' : '▶'}
                </button>
            </div>
        </div>
    );
}