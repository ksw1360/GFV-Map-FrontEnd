'use client';

import React, { useState, useEffect } from 'react';

interface Restaurant {
    restaurantId: number;
    name: string;
    address: string;
    points: string;
    matchedMenus: string[];
    veganType: string;
    rating?: number;
}

interface SidebarProps {
    restaurants: Restaurant[];
    selectedIndex: number | null;
    onShopSelect: (index: number) => void;
    isOpenProps: boolean; // 💡 부모에게 사이드바 상태 전역 수입
    onToggleSidebar: (open: boolean) => void; // 💡 상태가 바뀔 때 부모에게 보고할 콜백 통로
}

export default function Sidebar({
                                    restaurants,
                                    selectedIndex,
                                    onShopSelect,
                                    isOpenProps,
                                    onToggleSidebar
                                }: SidebarProps) {
    const [sortRule, setSortRule] = useState('distance');

    const processedList = [...restaurants].sort((a, b) => {
        if (sortRule === 'rating') {
            return (b.rating || 0) - (a.rating || 0);
        }
        return a.restaurantId - b.restaurantId;
    });

    // 💡 접기/펴기 버튼을 누를 때, 내 내부 상태만 바꾸는 게 아니라 부모 타워의 센서까지 즉시 동기화 제어합니다.
    const handleToggleClick = () => {
        const nextState = !isOpenProps;
        onToggleSidebar(nextState);
    };

    return (
        /* 전체 오버레이 absolute 컨테이너 (지도 클릭 관통 허용) */
        <div className="absolute inset-y-0 left-0 flex h-full z-10 pointer-events-none">

            {/* 사이드바 본체 패널 (isOpenProps 스위치에 따라 300ms 슬라이딩) */}
            <div
                className={`bg-white border-r border-gray-200 h-full flex flex-col transition-all duration-300 pointer-events-auto shadow-2xl flex-shrink-0 ${
                    isOpenProps
                        ? 'w-[360px] translate-x-0'
                        : 'w-[360px] -translate-x-full overflow-hidden border-r-0'
                }`}
            >
                {/* 상단 정렬 바 */}
                <div className="p-4 border-b border-gray-100 flex-shrink-0">
                    <select value={sortRule} onChange={(e) => setSortRule(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 focus:outline-none cursor-pointer">
                        <option value="distance">거리순 정렬 (F-SEARCH-003)</option>
                        <option value="rating">평점순 정렬</option>
                    </select>
                </div>

                {/* 식당 카드 리스트 영역 */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {processedList.map((shop, index) => (
                        <div
                            key={`sidebar-shop-${shop.restaurantId}-${index}`}
                            onClick={() => onShopSelect(index)}
                            className={`p-4 border rounded-2xl bg-white transition-all cursor-pointer hover:border-green-600 hover:shadow-sm ${
                                selectedIndex === index
                                    ? 'border-green-600 ring-2 ring-green-600/10 bg-green-50/20'
                                    : 'border-gray-200'
                            }`}
                        >
                            <div className="flex space-x-3">
                                <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center text-xs text-gray-400 flex-shrink-0">사진</div>
                                <div className="space-y-1 overflow-hidden w-full">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-sm text-gray-900 truncate max-w-[180px]">{shop.name}</h3>
                                        <span className="text-[9px] bg-green-100 text-green-800 font-extrabold px-1.5 py-0.5 rounded-md flex-shrink-0">{shop.veganType}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">{shop.address}</p>
                                    {shop.matchedMenus && shop.matchedMenus.length > 0 && (
                                        <p className="text-[10px] text-gray-400 truncate pt-0.5">
                                            🔍 관련 메뉴: <span className="text-gray-600 font-medium">{shop.matchedMenus.join(', ')}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {processedList.length === 0 && <div className="text-center py-20 text-xs text-gray-400">검색 조건에 맞는 매장이 없습니다.</div>}
                </div>
            </div>

            <div
                className={`flex items-center h-full pointer-events-auto flex-shrink-0 transition-all duration-300 ease-out ${
                    isOpenProps
                        ? 'transform translate-x-0'
                        : 'transform -translate-x-[360px]'
                }`}
            >
                <button
                    type="button"
                    onClick={handleToggleClick} // 💡 위에서 선언한 연동 제어 함수 호출
                    className="bg-white border border-gray-200 border-l-0 hover:bg-gray-50 text-gray-600 p-2 rounded-r-xl shadow-md transition-all -ml-[1px] h-14 flex items-center justify-center font-bold text-sm z-30"
                    title={isOpenProps ? '사이드바 접기' : '사이드바 열기'}
                >
                    {isOpenProps ? '◀' : '▶'}
                </button>
            </div>
        </div>
    );
}