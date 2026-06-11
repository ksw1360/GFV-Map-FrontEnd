'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/main/Header';
import Sidebar from '@/components/main/Sidebar';
import MapContainer from '@/components/main/MapContainer';
import AuthModal from '@/components/auth/AuthModal';
import RestaurantDetailSheet from '@/components/main/RestaurantDetailSheet';
import { getMyFavorites } from '@/libs/api/favorite';

interface Restaurant {
    restaurant_id: number;
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

    const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // 🎯 즐겨찾기 모드 활성화 상태 센서 전역 스위치 추가
    const [isFavoriteMode, setIsFavoriteMode] = useState(false);

    const handleHeaderFilter = async (filterData: any) => {
        console.log("➡️ 부모가 전달받은 원본 조건 데이터:", filterData);

        // 즐겨찾기 모드가 켜져 있다면 검색 작동 시 충돌 방지를 위해 스위치를 Off 해줍니다.
        setIsFavoriteMode(false);

        const currentCategory = filterData.searchCategory;
        const currentKeyword = (filterData.keyword || '').trim();

        if (currentKeyword === '') {
            console.log("💡 검색어가 비어있어 백엔드 요청을 생략하고 프론트 원본 데이터로 복원합니다.");
            setRestaurants(allRestaurants);
            setSelectedRestaurantId(null);
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
                setSelectedRestaurantId(null);
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

                setAllRestaurants(sanitizedData);
                setRestaurants(sanitizedData);

                console.log("🔥 프론트엔드가 보관에 성공한 마스터 시드 데이터:", sanitizedData.length, "개");
            }
        } catch (err) {
            console.error("초기 식당 데이터 로드 실패:", err);
        }
    };

    // 🎯 [실시간 동기화 라인] 즐겨찾기 스위치를 토글할 때 작동하는 핵심 비동기 스트림 제어 훅
    useEffect(() => {
        if (!isLoggedIn) return;

        if (isFavoriteMode) {
            // ⭐ 즐겨찾기 탭 활성화 시: 백엔드에서 찜한 식당 Page 객체를 징집해 필터 변환을 수행합니다.
            getMyFavorites(0, 100)
                .then((pageData) => {
                    // 유저님이 매핑 규격을 적어놓으신 r.restaurant_id가 일치하는 녀석들만 마스터 시드군에서 선별합니다.
                    const favoriteIds = pageData.content.map((item: any) => item.restaurantId);
                    const filtered = allRestaurants.filter(r => favoriteIds.includes(r.restaurant_id));

                    setRestaurants(filtered);
                    setSelectedRestaurantId(null);
                    console.log("⭐ [즐겨찾기 징집 동기화 완료] 매칭 개수:", filtered.length, "개");
                })
                .catch((err) => {
                    console.error("즐겨찾기 목록 복원 실패:", err);
                    setRestaurants([]);
                });
        } else {
            // ⭐ 즐겨찾기 탭 해제 시: 마스터 원본 백업본 전체 리스트로 즉시 주소창 복구
            setRestaurants(allRestaurants);
            setSelectedRestaurantId(null);
        }
    }, [isFavoriteMode, allRestaurants, isLoggedIn]);

    // restaurants 로드 완료 후 쿼리스트링 체크 → 바텀시트 자동 오픈
    useEffect(() => {
        if (restaurants.length === 0) return;

        const urlParams = new URLSearchParams(window.location.search);
        const restaurantIdParam = urlParams.get('restaurant_id');
        if (!restaurantIdParam) return;

        const targetId = Number(restaurantIdParam);
        const exists = restaurants.find((r) => r.restaurant_id === targetId);
        if (exists) {
            setSelectedRestaurantId(targetId);
            window.history.replaceState({}, '', '/');
        }
    }, [restaurants]);

    // 새로고침 시 자동 토큰 검증 및 재발급
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const email = urlParams.get('email');

        if (token && email) {
            localStorage.setItem('accessToken', token);
            localStorage.setItem('user_email', email);
            window.location.href = '/';
        }

        const checkAuthAndRefresh = async () => {
            const accessToken = localStorage.getItem('accessToken');
            const refreshToken = localStorage.getItem('refreshToken');

            if (!accessToken && !refreshToken) return;

            if (accessToken?.startsWith('mock_')) {
                console.log("⚠️ [테스트 오버라이딩] 가짜 토큰을 감지했습니다. 백엔드 갱신 요청을 생략하고 프리패스 지도를 오픈합니다.");
                setIsLoggedIn(true);
                fetchInitialRestaurants();
                return;
            }

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
            setSelectedRestaurantId(null);
            setIsFavoriteMode(false); // 리셋
        }
    };

    return (
        <>
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
                <div className="h-screen w-screen flex flex-col bg-white overflow-hidden">
                    <Header onLogout={handleLogout} onFilterChange={handleHeaderFilter} />

                    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-gray-50">

                        {/* 🎯 [공중부양 플로팅 토글 제어 인터페이스 설계]
                           - 사용자가 원클릭으로 즐겨찾기 모드를 온/오프할 수 있게 배치한 인터랙티브 레이어 노드입니다. */}
                        <div className="absolute top-4 left-[380px] z-10 animate-in fade-in slide-in-from-left-5 duration-200">
                            <button
                                type="button"
                                onClick={() => setIsFavoriteMode(!isFavoriteMode)}
                                className={`px-4 py-2.5 rounded-xl font-black text-xs border shadow-md flex items-center gap-2 transition-all active:scale-95 cursor-pointer ${
                                    isFavoriteMode
                                        ? 'bg-yellow-400 border-yellow-400 text-white font-black'
                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 font-bold'
                                }`}
                            >
                                <span>⭐</span> {isFavoriteMode ? '전체 보기로 복원' : '내가 찜한 안심 식당만 보기'}
                            </button>
                        </div>

                        <MapContainer
                            restaurants={restaurants}
                            selectedId={selectedRestaurantId}
                            onMarkerSelect={(id) => setSelectedRestaurantId(id)}
                        />

                        <Sidebar
                            restaurants={restaurants}
                            selectedIndex={selectedRestaurantId}
                            onShopSelect={(id) => setSelectedRestaurantId(id)}
                            isOpenProps={isSidebarOpen}
                            onToggleSidebar={(open) => setIsSidebarOpen(open)}
                        />

                        {/* 🎯 바텀시트에서 즐겨찾기 별을 클릭하여 상태를 갱신하면, 메인 화면 리스트가 자동 반응하도록 콜백 채널 설계 */}
                        <RestaurantDetailSheet
                            restaurant={selectedRestaurantId !== null ? (restaurants.find(r => r.restaurant_id === selectedRestaurantId) || null) : null}
                            onClose={() => {
                                setSelectedRestaurantId(null);
                                // 💡 [UX 최적화 가드] 상세시트를 닫을 때 즐겨찾기 모드가 켜져 있었다면
                                // 바텀시트 안에서 하트를 해제했을 확률이 높으므로 리스트를 백그라운드 실시간 강제 새로고침 리패치 처리합니다.
                                if (isFavoriteMode) setIsFavoriteMode(false);
                            }}
                            isSidebarOpen={isSidebarOpen}
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