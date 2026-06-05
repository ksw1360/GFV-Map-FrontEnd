'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/main/Header';
import Sidebar from '@/components/main/Sidebar';
import MapContainer from '@/components/main/MapContainer';
import AuthModal from '@/components/auth/AuthModal';

interface Restaurant {
    restaurantId: number;        // 백엔드 명세 고유 ID (id에서 restaurantId로 매칭)
    name: string;
    address: string;
    points: string;              // 💡 "위도/경도" 형태의 단일 문자열 (예: "37.5172/127.0473")
    matchedMenus: string[];      // 검색어 매칭 메뉴 리스트
    veganType: string;           // 비건 유형 (예: "LACTO", "VEGAN")
    rating?: number;             // 사이드바 정렬용 선택 필드
}

export default function MainPage() {
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // MainPage.tsx 상태 머신 구역
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]); // 원본 저장소
    const [selectedShopId, setSelectedShopId] = useState<number | null>(null);

    // 헤더의 검색창/카테고리 값이 바뀔 때 작동할 비동기 네트워크 트래픽 핸들러
    const handleHeaderFilter = async (filterData: { keyword: string; searchCategory: string }) => {
        try {
            const accessToken = localStorage.getItem('accessToken');

            // GFV-Map_API명세서 상의 식당 검색 엔드포인트 연동
            const response = await fetch(
                `http://192.168.7.120:5000/restaurant/search?keyword=${filterData.keyword || ''}&searchCategory=${filterData.searchCategory || 'store'}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        // 💡 [처방] 백엔드 시큐리티 장벽을 통과하기 위해 Bearer 토큰 주입!
                        'Authorization': accessToken ? `Bearer ${accessToken}` : ''
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                setRestaurants(data);
            }
        } catch (err) {
            console.error("식당 검색 조회 실패:", err);
        }
    };

    // 메인 본체 진입 시 혹은 로그인 직후 빈 화면 방지용 최초 1회 로드 함수
    const fetchInitialRestaurants = async () => {
        try {
            // 키워드가 없을 때 전체 혹은 기본 리스트를 리턴하는 엔드포인트 호출
            const response = await fetch('http://192.168.7.120:5000/restaurant/search?keyword=&searchCategory=store');
            if (response.ok) {
                const data = await response.json();
                setRestaurants(data); // 초기에 맵에 뿌려질 시드 데이터 장착
            }
        } catch (err) {
            console.error("초기 식당 데이터 로드 실패:", err);
        }
    };

    // ──────────────────────────────────────────────────────────
    // 🔄 새로고침 시 자동 토큰 검증 및 재발급 레이어 (기존 로직 100% 유지)
    // ──────────────────────────────────────────────────────────
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

                    localStorage.setItem('accessToken', data.accessToken);
                    if (data.refreshToken) {
                        localStorage.setItem('refreshToken', data.refreshToken);
                    }

                    setIsLoggedIn(true);
                    fetchInitialRestaurants(); // 💡 자동 로그인 연장 성공 시 즉시 초기 데이터 충전!
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

    // 로그인 모달 성공 시 메인 지도 UI 활성화
    const handleModalClose = () => {
        setIsAuthOpen(false);
        setIsLoggedIn(true);
        fetchInitialRestaurants(); // 💡 모달 로그인 즉시 성공 시에도 데이터 즉시 수입!
    };

    // 로그아웃 클릭 시 금고 비우고 메인 첫 웰컴 안내 스크린으로 이탈
    const handleLogout = () => {
        if (confirm('로그아웃 하시겠습니까?')) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setIsLoggedIn(false);
            setRestaurants([]); // 보안을 위해 리스트 초기화
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
                /* 시나리오 B 구역 JSX 조립 */
                <div className="h-screen w-screen flex flex-col bg-white overflow-hidden">
                    <Header onLogout={handleLogout} onFilterChange={handleHeaderFilter} />

                    {/* 💡 [수정] flex-grow 대신 높이 calc를 통해 지도 영역을 강제로 벌려줍니다 */}
                    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden">
                        <MapContainer restaurants={restaurants} selectedId={selectedShopId} />

                        <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none z-10">
                            <Sidebar
                                restaurants={restaurants}
                                selectedId={selectedShopId}
                                onShopSelect={(id) => setSelectedShopId(id)}
                            />
                        </div>
                    </div>
                </div>
            )}

            <AuthModal isOpen={isAuthOpen} onClose={handleModalClose} />
        </>
    );
}