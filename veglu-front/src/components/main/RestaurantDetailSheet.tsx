'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Restaurant {
    restaurantId: number;
    name: string;
    address: string;
    points: string;
    matchedMenus: string[];
    veganType: string;
}

interface MenuSpec {
    menuId: number;
    name: string;
    price: number;
    description: string;
    category: 'MAIN' | 'SIDE' | 'DRINK' | 'DESSERT';
    veganType: 'VEGAN' | 'LACTO' | 'OVO' | 'LACTO_OVO' | 'PESCO';
    allergens: string[];
    imageUrl: string;
    isSignature: boolean;
    isAvailable: boolean;
    isSeasonal: boolean;
}

interface RestaurantDetailSheetProps {
    restaurant: Restaurant | null;
    onClose: () => void;
    isSidebarOpen: boolean;
}

type TabType = 'HOME' | 'MENU' | 'REVIEW' | 'PHOTO';

export default function RestaurantDetailSheet({ restaurant, onClose, isSidebarOpen }: RestaurantDetailSheetProps) {

    const [activeTab, setActiveTab] = useState<TabType>('HOME');
    const [shouldRender, setShouldRender] = useState(false);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);

    // ──────────────────────────────────────────────────────────
    // 🛡️ [에러 해결 마법의 열쇠] 팅김 버그 방어용 식당 데이터 마스터 캐시 락
    // ──────────────────────────────────────────────────────────
    const cachedRestaurantRef = useRef<Restaurant | null>(null);

    // 부모로부터 받아온 알맹이가 유효할 때마다 금고 캐시에 박아둡니다.
    if (restaurant) {
        cachedRestaurantRef.current = restaurant;
    }

    // 최종 가동 렌더링은 부모의 변수가 아닌 안전하게 홀딩된 금고 데이터로 집행합니다.
    const currentViewShop = restaurant || cachedRestaurantRef.current;
    // ──────────────────────────────────────────────────────────

    const [menus, setMenus] = useState<MenuSpec[]>([]);
    const [isMenuLoading, setIsMenuLoading] = useState(false);

    useEffect(() => {
        if (restaurant) {
            setShouldRender(true);
            setIsAnimatingOut(false);
            setActiveTab('HOME');
            setMenus([]);
        } else if (shouldRender) {
            // ✕ 를 눌렀을 때 퇴장 모션을 가동합니다.
            // 이때 currentViewShop이 캐시로 보존되어 있어 팅기지 않습니다!
            setIsAnimatingOut(true);
            const timer = setTimeout(() => {
                setShouldRender(false);
                setIsAnimatingOut(false);
                cachedRestaurantRef.current = null; // 내려간 직후 캐시도 완전 청소
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [restaurant]);

    useEffect(() => {
        if (activeTab === 'MENU' && currentViewShop) {
            fetchRestaurantMenus(currentViewShop.restaurantId);
        }
    }, [activeTab, restaurant]); // 💡 부모 데이터 혹은 탭 전환 싱크 감시

    const fetchRestaurantMenus = async (id: number) => {
        setIsMenuLoading(true);
        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await fetch(`http://192.168.7.120:5000/restaurant/${id}/menus`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': accessToken ? `Bearer ${accessToken}` : ''
                }
            });
            if (response.ok) {
                const data = await response.json();
                setMenus(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error("해당 식당 메뉴판 API 수입 실패:", err);
        } finally {
            setIsMenuLoading(false);
        }
    };

    const handleCloseTrigger = () => {
        setIsAnimatingOut(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    if (!shouldRender || !currentViewShop) return null;

    return (
        <div
            className={`fixed bottom-0 right-0 bg-white border-t border-gray-200 rounded-t-3xl shadow-[0_-15px_35px_rgba(0,0,0,0.1)] z-20 p-6 flex flex-col transition-all duration-300 ease-out h-[400px] ${
                isSidebarOpen ? 'left-[360px]' : 'left-0'
            } ${
                isAnimatingOut ? 'transform translate-y-full opacity-0' : 'transform translate-y-0 opacity-100'
            }`}
        >
            {/* 상단 레이아웃 명세 헤더 - 이제 currentViewShop 수선으로 유실 가드가 완벽히 적용되었습니다! */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-3 flex-shrink-0">
                <div className="flex items-center space-x-4 overflow-hidden">
                    <div className="w-14 h-14 bg-green-50 border border-green-100 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl shadow-inner">🌱</div>
                    <div className="space-y-1 overflow-hidden">
                        <div className="flex items-center space-x-2.5">
                            <h2 className="text-lg font-black text-gray-900 truncate max-w-[280px] md:max-w-[500px]">
                                {currentViewShop.name}
                            </h2>
                            <span className="text-[10px] bg-green-700 text-white font-black px-2 py-0.5 rounded-md uppercase tracking-wider flex-shrink-0">
                                {currentViewShop.veganType}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 font-semibold truncate">📍 {currentViewShop.address}</p>
                    </div>
                </div>
                <button type="button" onClick={handleCloseTrigger} className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-xl transition-colors border border-gray-200 flex items-center justify-center w-9 h-9">✕</button>
            </div>

            {/* 4단 탭 바 */}
            <div className="flex space-x-1 border-b border-gray-100 my-3 text-xs font-bold flex-shrink-0">
                {(['HOME', 'MENU', 'REVIEW', 'PHOTO'] as const).map((tab) => {
                    const tabNames = { HOME: '홈 (기본)', MENU: '메뉴', REVIEW: '리뷰', PHOTO: '사진' };
                    return (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2.5 transition-all relative top-[1px] ${activeTab === tab ? 'text-green-700 border-b-2 border-green-700 font-extrabold' : 'text-gray-400 hover:text-gray-600 font-medium'}`}
                        >
                            {tabNames[tab]}
                        </button>
                    );
                })}
            </div>

            {/* 메인 가동 콘텐트 구역 */}
            <div className="flex-1 overflow-y-auto pr-1 text-xs text-gray-600 leading-relaxed min-h-0 bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                {activeTab === 'HOME' && (
                    <div className="space-y-3 animate-in fade-in duration-200">
                        <p className="font-semibold text-gray-800 text-sm">💡 매장 안내 요약</p>
                        <div className="bg-white p-3.5 border border-gray-200 rounded-xl space-y-2 shadow-sm">
                            <p>✔️ 저희 매장은 동물성 원료를 일체 배제한 안심 비건 가공 공정을 거칩니다.</p>
                            {currentViewShop.matchedMenus && currentViewShop.matchedMenus.length > 0 && (
                                <p>🔍 검색어 매칭 키워드: <span className="text-green-700 font-bold bg-green-50 px-1.5 py-0.5 rounded-md">{currentViewShop.matchedMenus.join(', ')}</span></p>
                            )}
                            <p>⏰ 영업 시간: 매일 10:00 ~ 21:00 (라스트오더 20:30)</p>
                        </div>
                    </div>
                )}

                {activeTab === 'MENU' && (
                    <div className="space-y-2 animate-in fade-in duration-200">
                        <p className="font-semibold text-gray-800 text-sm">📋 실물 메뉴판 명세 (서버 실시간 연동)</p>

                        {isMenuLoading && (
                            <div className="text-center py-10 font-medium text-gray-400 animate-pulse">식당 메뉴판 패킷 긁어오는 중...</div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {menus.map((item) => (
                                <div key={item.menuId} className="bg-white p-4 border border-gray-200 rounded-2xl flex space-x-3 shadow-sm hover:border-green-500 transition-all relative overflow-hidden">
                                    {item.isSignature && (
                                        <div className="absolute top-0 left-0 bg-amber-500 text-white text-[8px] font-black px-2 py-0.5 rounded-br-lg uppercase tracking-tighter">RECOMMEND</div>
                                    )}
                                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex-shrink-0 border overflow-hidden flex items-center justify-center text-xs text-gray-400">
                                        {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /> : 'NO IMG'}
                                    </div>
                                    <div className="space-y-1 w-full overflow-hidden">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-gray-900 text-xs truncate max-w-[140px]">{item.name}</h4>
                                            <span className="text-[10px] font-black text-green-700">{item.price.toLocaleString()}원</span>
                                        </div>
                                        <p className="text-[11px] text-gray-400 truncate leading-tight">{item.description || '상세 설명 명세가 준비되어 있지 않습니다.'}</p>
                                        <div className="flex flex-wrap gap-1 pt-0.5">
                                            <span className="text-[8px] bg-green-50 text-green-700 border border-green-200/50 font-extrabold px-1 rounded-sm">{item.veganType}</span>
                                            {item.allergens && item.allergens.map(al => (
                                                <span key={al} className="text-[8px] bg-red-50 text-red-600 border border-red-100 font-medium px-1 rounded-sm">🚫 {al}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {!isMenuLoading && menus.length === 0 && (
                                <div className="col-span-2 text-center py-10 text-xs text-gray-400 font-medium">등록된 메뉴판 명세 데이터가 부재합니다.</div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'REVIEW' && <div className="p-4 text-center font-medium text-gray-400">후속 방문자 리뷰 연동 구역 (리뷰 API 연동 예정)</div>}
                {activeTab === 'PHOTO' && <div className="p-4 text-center font-medium text-gray-400">매장 고화질 갤러리 연동 구역 (사진 API 연동 예정)</div>}
            </div>
        </div>
    );
}