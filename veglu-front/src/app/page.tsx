'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/main/Header';
import Sidebar from '@/components/main/Sidebar';
import MapContainer from '@/components/main/MapContainer';
import AuthModal from '@/components/auth/AuthModal';
import RestaurantDetailSheet from '@/components/main/RestaurantDetailSheet';

interface Restaurant {
    restaurantId: number;
    name: string;
    address: string;
    points: string;
    matchedMenus: string[];
    veganType: string;
    rating?: number;
}

export default function MainPage() {
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]); // 전체 데이터 백업본
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);    // 화면(지도/사이드바)에 뿌려질 최종본
    const [selectedShopIndex, setSelectedShopIndex] = useState<number | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // 헤더에서 검색 확정 시 작동하는 비동기 통신 및 프론트 오버라이딩 엔진
    const handleHeaderFilter = async (filterData: any) => {
        console.log("➡️ 부모가 전달받은 원본 조건 데이터:", filterData);

        const currentCategory = filterData.searchCategory; // 'region', 'store', 'menu'
        const currentKeyword = (filterData.keyword || '').trim(); // 공백 제거

        if (currentKeyword === '') {
            console.log("💡 검색어가 비어있어 백엔드 요청을 생략하고 프론트 원본 데이터로 복원합니다.");
            setRestaurants(allRestaurants);
            setSelectedShopIndex(null); // ◀ 오타 교정 완료! (Id -> Index)
            return;
        }

        try {
            const accessToken = localStorage.getItem('accessToken');
            const targetKeyword = encodeURIComponent(currentKeyword);

            let apiUrl = `http://192.168.7.120:5000/restaurant/name?keyword=${targetKeyword}`;
            if (currentCategory === 'region') {
                apiUrl = `http://192.168.7.120:5000/restaurant/region?keyword=${targetKeyword}`;
            } else if (currentCategory === 'menu') {
                apiUrl = `http://192.168.7.120:5000/restaurant/menu?keyword=${targetKeyword}`;
            }

            console.log(`🔎 [검색 실행] 백엔드로 찌르는 최종 주소 ➔ ${apiUrl}`);

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': accessToken ? `Bearer ${accessToken}` : ''
                }
            });

            if (response.ok) {
                const data = await response.json();
                const sanitizedData = Array.isArray(data) ? data : [];
                setRestaurants(sanitizedData);
                setSelectedShopIndex(null); // 리셋도 index 기준으로 변경
            }
        } catch (err) {
            console.error("식당 검색 조회 에러:", err);
        }
    };

    const fetchInitialRestaurants = async () => {
        try {
            const accessToken = localStorage.getItem('accessToken');

            const response = await fetch(
                'http://192.168.7.120:5000/restaurant/name?keyword=',
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': accessToken ? `Bearer ${accessToken}` : ''
                    }
                }
            );
            if (response.ok) {
                const data = await response.json();
                const sanitizedData = Array.isArray(data) ? data : [];

                // 받아온 소중한 실물 식당 배열 군단을 원본 백업본과 화면 출력본 두 곳에 동시에 잠가둡니다.
                setAllRestaurants(sanitizedData);
                setRestaurants(sanitizedData);

                console.log("🔥 프론트엔드가 보관에 성공한 마스터 시드 데이터:", sanitizedData.length, "개");
            }
        } catch (err) {
            console.error("초기 식당 데이터 로드 실패:", err);
        }
    };
    // ──────────────────────────────────────────────────────────

    // 새로고침 시 자동 토큰 검증 및 재발급 레이어 (기존 로직 100% 유지)
    useEffect(() => {
        const checkAuthAndRefresh = async () => {
            const accessToken = localStorage.getItem('accessToken');
            const refreshToken = localStorage.getItem('refreshToken');

            if (!accessToken && !refreshToken) return;

            try {
                const response = await fetch('http://192.168.7.120:5000/auth/refresh', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({ refreshToken: refreshToken })
                });

                if (response.ok) {
                    const data = await response.json();

                    // 백엔드가 새로 갱신해 준 따끈따끈한 새 토큰을 다시 금고에 저장
                    localStorage.setItem('accessToken', data.accessToken);
                    if (data.refreshToken) {
                        localStorage.setItem('refreshToken', data.refreshToken);
                    }

                    setIsLoggedIn(true);
                    fetchInitialRestaurants();
                } else {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                }
            } catch (err) {
                console.error('자동 로그인 재발급 통신 중 오류:', err);
            }
        };

        checkAuthAndRefresh();
    }, []);

    const handleModalClose = () => {
        setIsAuthOpen(false);
    };

    const handleLoginSuccess = () => {
        setIsAuthOpen(false);
        setIsLoggedIn(true);
        fetchInitialRestaurants();
    };

    const handleLogout = () => {
        if (confirm('로그아웃 하시겠습니까?')) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setIsLoggedIn(false);
            setRestaurants([]);
            setAllRestaurants([]);
            setSelectedShopIndex(null); // 💡 로그아웃 시 선택 인덱스 깔끔하게 청소
        }
    };

    return (
        <>
            {/* 시나리오 A: 로그인 전 (웰컴 스크린) */}
            {!isLoggedIn ? (
                <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-gray-50 p-4 select-none">
                    <div className="text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                        <div className="text-5xl animate-bounce mb-2">🌱🍞</div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            비건 & 글루텐프리 안심 지도
                        </h1>
                        <p className="text-gray-500 max-w-sm text-sm">
                            내 주변의 안심하고 먹을 수 있는 채식 식당과 속 편한 쌀 베이커리를 지도에서 한눈에 확인해 보세요.
                        </p>
                        <button
                            type="button"
                            onClick={() => setIsAuthOpen(true)}
                            className="mt-4 px-6 py-3 bg-green-700 hover:bg-green-800 text-white font-medium rounded-xl text-sm transition-all shadow-md active:scale-95"
                        >
                            시작하기 (로그인)
                        </button>
                    </div>
                </div>
            ) : (
                /* 시나리오 B: 로그인 후 (본체 비건 지도 시스템) */
                <div className="h-screen w-screen flex flex-col bg-white overflow-hidden">
                    <Header onLogout={handleLogout} onFilterChange={handleHeaderFilter} />

                    {/* 메인 뷰포트 무대 */}
                    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-gray-50">

                        {/* 1. 카카오 지도 레이어 (화면 전체 100% 가득 안착) */}
                        <MapContainer
                            restaurants={restaurants}
                            selectedIndex={selectedShopIndex}
                            onMarkerSelect={(index) => setSelectedShopIndex(index)}
                        />

                        {/* 2. 공중부양 오버레이 사이드바 (z-10)
                   - 내부의 isOpen 스위치와 상태 세터를 부모 전역 센서인 isSidebarOpen 링크와 직결시킵니다. */}
                        <Sidebar
                            restaurants={restaurants}
                            selectedIndex={selectedShopIndex}
                            onShopSelect={(index) => setSelectedShopIndex(index)}
                            isOpenProps={isSidebarOpen} // 💡 Sidebar.tsx 내부 useState(true) 대신 부모가 컨트롤하도록 전달 가능
                            onToggleSidebar={(open) => setIsSidebarOpen(open)} // 💡 토글 알림방
                        />

                        <RestaurantDetailSheet
                            restaurant={selectedShopIndex !== null ? restaurants[selectedShopIndex] : null}
                            onClose={() => setSelectedShopIndex(null)}
                            isSidebarOpen={isSidebarOpen} // 💡 링커 결속 완료!
                        />

                    </div>
                </div>
            )}

            <AuthModal
                isOpen={isAuthOpen}
                onClose={handleModalClose}
                onLoginSuccess={handleLoginSuccess}
            />
        </>
    );
}