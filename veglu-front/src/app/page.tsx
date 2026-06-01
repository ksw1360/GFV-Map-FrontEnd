'use client';

import React, { useState } from 'react';
import Header from '@/components/main/Header';
import Sidebar from '@/components/main/Sidebar';
import MapContainer from '@/components/main/MapContainer';
import AuthModal from '@/components/auth/AuthModal';

export default function MainPage() {
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // 로그인 성공 시 메인 지도 UI 활성화
    const handleModalClose = () => {
        setIsAuthOpen(false);
        setIsLoggedIn(true);
    };

    // 로그아웃 클릭 시 메인 첫 웰컴 안내 스크린으로 이탈
    const handleLogout = () => {
        if (confirm('로그아웃 하시겠습니까?')) {
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

                    {/* Header 컴포넌트에 마이페이지 라우터 내장형 프롭스 연결 완료 */}
                    <Header onLogout={handleLogout} />

                    <div className="flex-1 relative w-full h-full overflow-hidden">
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