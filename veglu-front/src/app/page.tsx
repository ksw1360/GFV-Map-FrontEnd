'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/main/Header';
import Sidebar from '@/components/main/Sidebar';
import MapContainer from '@/components/main/MapContainer';
import AuthModal from '@/components/auth/AuthModal';

<<<<<<< HEAD
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

    // ──────────────────────────────────────────────────────────
    // 💡 [우회 핵심] 백엔드 버그 방어를 위한 원본 보관소 분리 선언
    // ──────────────────────────────────────────────────────────
    const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]); // ◀ 전체 데이터 백업본
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);    // ◀ 화면(지도/사이드바)에 뿌려질 최종본
    const [selectedShopIndex, setSelectedShopIndex] = useState<number | null>(null);

    // 헤더에서 검색 확정 시 작동하는 비동기 통신 및 프론트 오버라이딩 엔진
    const handleHeaderFilter = async (filterData: any) => {
        console.log("➡️ 부모가 전달받은 원본 조건 데이터:", filterData);

        const currentCategory = filterData.searchCategory; // 'region', 'store', 'menu'
        const currentKeyword = (filterData.keyword || '').trim(); // 공백 제거

        // 🎯 [프론트 우회 락 해제 1] 검색어가 비어있다면 백엔드에 찌르지 않고 원본 백업본을 그대로 복구합니다!
        if (currentKeyword === '') {
            console.log("💡 검색어가 비어있어 백엔드 요청을 생략하고 프론트 원본 데이터로 복원합니다.");
            setRestaurants(allRestaurants);
            setSelectedShopId(null);
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
                setSelectedShopIndex(null); // 💡 리셋도 index 기준으로 변경
            }
        } catch (err) {
            console.error("식당 검색 조회 에러:", err);
        }
    };

    // ──────────────────────────────────────────────────────────
    // 🎯 [우회 핵심] 처음 화면이 켜질 때 DB에 존재하는 데이터를 '확실한 키워드'로 강제 수집
    // ──────────────────────────────────────────────────────────
    const fetchInitialRestaurants = async () => {
        try {
            const accessToken = localStorage.getItem('accessToken');

            // 💡 백엔드 DB에 무조건 들어있을 법한 글자(예: 샐러디를 뽑아내기 위한 '점', '역', '시', '로' 등 공통 조사)를
            // 우회로 던져서 데이터셋 전체 혹은 일부를 강제로 탈취해 옵니다.
            // 만약 백엔드에 전체를 주는 전용 엔드포인트(예: /restaurant/list)가 생기면 주소만 바꾸면 됩니다.
            const response = await fetch(
                'http://192.168.7.120:5000/restaurant/name?keyword=', // ◀ 백엔드가 쿼리문 수정하기 전까진 빈값 시 0개이므로, 팀원에게 전체목록 주는 주소 물어보고 교체 가능
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

                // 💡 받아온 소중한 실물 식당 배열 군단을 원본 백업본과 화면 출력본 두 곳에 동시에 잠가둡니다.
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
=======
export default function MainPage() {
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    // 💡 중요: 새로고침 시 깜빡이면서 웰컴 스크린이 잠깐 보이는 것을 막기 위해
    // 기본 상태를 검증 중(isLoading) 레이어로 가드할 수도 있지만, 일단 기본 흐름을 잡습니다.
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // ──────────────────────────────────────────────────────────
    // 🔄 [신규 추가] 새로고침 시 자동 토큰 검증 및 재발급 레이어
    // ──────────────────────────────────────────────────────────
    useEffect(() => {
        const checkAuthAndRefresh = async () => {
            // 1. 로컬스토리지나 쿠키에 기존 토큰 흔적이 남아있는지 먼저 검사합니다.
            const accessToken = localStorage.getItem('accessToken');
            const refreshToken = localStorage.getItem('refreshToken');

            // 아예 토큰 흔적이 없다면 처음 방문한 유저이므로 그냥 로그인 전 화면 유지
            if (!accessToken && !refreshToken) return;

            try {
                // 2. 팀원 백엔드 컴퓨터의 토큰 재발급 엔드포인트 주소를 찌릅니다.
                // (일반적으로 Refresh Token을 헤더나 바디에 실어 보냅니다.)
>>>>>>> teammate-repo/main
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

<<<<<<< HEAD
=======
                    // 3. 백엔드가 새로 갱신해 준 따끈따끈한 새 토큰을 다시 금고에 저장
>>>>>>> teammate-repo/main
                    localStorage.setItem('accessToken', data.accessToken);
                    if (data.refreshToken) {
                        localStorage.setItem('refreshToken', data.refreshToken);
                    }

<<<<<<< HEAD
                    setIsLoggedIn(true);
                    fetchInitialRestaurants();
                } else {
=======
                    // 4. 리액트 스위치를 켜서 메인 지도로 강제 워프시킵니다.
                    setIsLoggedIn(true);
                } else {
                    // 토큰이 아예 유효기간 만료되어 거절당했다면 청소하고 튕겨내기
>>>>>>> teammate-repo/main
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                }
            } catch (err) {
                console.error('자동 로그인 재발급 통신 중 오류:', err);
            }
        };

        checkAuthAndRefresh();
<<<<<<< HEAD
    }, []);

    const handleModalClose = () => {
        setIsAuthOpen(false);
        setIsLoggedIn(true);
        fetchInitialRestaurants();
    };

=======
    }, []); // ◀ 빈 배열: 새로고침 후 브라우저 창이 딱 켜진 최초 1회만 발동!

    // 로그인 모달 성공 시 메인 지도 UI 활성화
    const handleModalClose = () => {
        setIsAuthOpen(false);
        setIsLoggedIn(true);
    };

    // 로그아웃 클릭 시 금고 비우고 메인 첫 웰컴 안내 스크린으로 이탈
>>>>>>> teammate-repo/main
    const handleLogout = () => {
        if (confirm('로그아웃 하시겠습니까?')) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setIsLoggedIn(false);
<<<<<<< HEAD
            setRestaurants([]);
            setAllRestaurants([]);
=======
>>>>>>> teammate-repo/main
        }
    };

    return (
        <>
<<<<<<< HEAD
=======
            {/* 시나리오 A: 로그인 전 (웰컴 스크린) */}
>>>>>>> teammate-repo/main
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
<<<<<<< HEAD
                <div className="h-screen w-screen flex flex-col bg-white overflow-hidden">
                    <Header onLogout={handleLogout} onFilterChange={handleHeaderFilter} />

                    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden">
                        <MapContainer restaurants={restaurants} selectedIndex={selectedShopIndex} />

                        <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none z-10">
                            <Sidebar
                                restaurants={restaurants}
                                selectedIndex={selectedShopIndex} // 💡 변경
                                onShopSelect={(index) => setSelectedShopIndex(index)} // 💡 클릭 시 식당의 '배열 순번'을 부모에게 전달
                            />
=======
                /* 시나리오 B: 로그인 후 (본체 비건 지도 시스템) */
                <div className="h-screen w-screen flex flex-col overflow-hidden select-none bg-white animate-in fade-in duration-500">
                    <Header onLogout={handleLogout} />

                    <div className="flex-1 relative w-full overflow-hidden">
                        <MapContainer />
                        <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none z-10">
                            <Sidebar />
>>>>>>> teammate-repo/main
                        </div>
                    </div>
                </div>
            )}

            <AuthModal isOpen={isAuthOpen} onClose={handleModalClose} />
        </>
    );
}