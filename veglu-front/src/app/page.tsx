'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/main/Header';
import Sidebar from '@/components/main/Sidebar';
import MapContainer from '@/components/main/MapContainer';
import AuthModal from '@/components/auth/AuthModal';

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

                    // 3. 백엔드가 새로 갱신해 준 따끈따끈한 새 토큰을 다시 금고에 저장
                    localStorage.setItem('accessToken', data.accessToken);
                    if (data.refreshToken) {
                        localStorage.setItem('refreshToken', data.refreshToken);
                    }

                    // 4. 리액트 스위치를 켜서 메인 지도로 강제 워프시킵니다.
                    setIsLoggedIn(true);
                } else {
                    // 토큰이 아예 유효기간 만료되어 거절당했다면 청소하고 튕겨내기
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                }
            } catch (err) {
                console.error('자동 로그인 재발급 통신 중 오류:', err);
            }
        };

        checkAuthAndRefresh();
    }, []); // ◀ 빈 배열: 새로고침 후 브라우저 창이 딱 켜진 최초 1회만 발동!

    // 로그인 모달 성공 시 메인 지도 UI 활성화
    const handleModalClose = () => {
        setIsAuthOpen(false);
        setIsLoggedIn(true);
    };

    // 로그아웃 클릭 시 금고 비우고 메인 첫 웰컴 안내 스크린으로 이탈
    const handleLogout = () => {
        if (confirm('로그아웃 하시겠습니까?')) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setIsLoggedIn(false);
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
                <div className="h-screen w-screen flex flex-col overflow-hidden select-none bg-white animate-in fade-in duration-500">
                    <Header onLogout={handleLogout} />

                    <div className="flex-1 relative w-full overflow-hidden">
                        <MapContainer />
                        <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none z-10">
                            <Sidebar />
                        </div>
                    </div>
                </div>
            )}

            <AuthModal isOpen={isAuthOpen} onClose={handleModalClose} />
        </>
    );
}