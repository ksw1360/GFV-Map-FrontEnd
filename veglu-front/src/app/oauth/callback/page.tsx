'use client';

import { useEffect, useState } from 'react';

export default function OAuthCallback() {
    const [statusText, setStatusText] = useState('로그인 세션을 확인 중입니다...');

    useEffect(() => {
        // 1. 쿼리 스트링(?accessToken=...) 파싱
        const searchParams = new URLSearchParams(window.location.search);
        let accessToken = searchParams.get('accessToken');
        let refreshToken = searchParams.get('refreshToken');
        let email = searchParams.get('email');
        let nickname = searchParams.get('nickname');
        let profileImageUrl = searchParams.get('profileImageUrl') || searchParams.get('avatar');
        let role = searchParams.get('role');

        // 2. 만약 쿼리 스트링에 토큰이 없다면 해시(#accessToken=...) 파싱 (OAuth2 Implicit Grant 대응)
        if (!accessToken && window.location.hash) {
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            accessToken = hashParams.get('accessToken');
            refreshToken = hashParams.get('refreshToken');
            email = hashParams.get('email');
            nickname = hashParams.get('nickname');
            profileImageUrl = hashParams.get('profileImageUrl') || hashParams.get('avatar');
            role = hashParams.get('role');
        }

        if (accessToken) {
            // LocalStorage에 인증 및 유저 정보 동기화 저장 전, 기존 로그인 잔재 청소
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user_email');
            localStorage.removeItem('user_nickname');
            localStorage.removeItem('user_avatar');
            localStorage.removeItem('user_role');

            localStorage.setItem('accessToken', accessToken);
            if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
            if (email) localStorage.setItem('user_email', email);
            if (nickname) localStorage.setItem('user_nickname', nickname);
            if (profileImageUrl) localStorage.setItem('user_avatar', profileImageUrl);
            if (role) localStorage.setItem('user_role', role);

            setTimeout(() => {
                setStatusText('🎉 인증 성공! 비건 안심 지도로 진입합니다.');
            }, 0);

            // React/Next.js의 Auth Provider 및 레이아웃 상태 갱신을 위해 window.location.href로 강제 새로고침 리다이렉트
            setTimeout(() => {
                window.location.href = '/';
            }, 500);
        } else {
            setTimeout(() => {
                setStatusText('⚠️ 인증 토큰을 찾을 수 없습니다. 로그인 페이지로 돌아갑니다.');
            }, 0);
            setTimeout(() => {
                window.location.href = '/login';
            }, 1500);
        }
    }, []);

    return (
        <div className="min-h-screen w-screen bg-white flex flex-col items-center justify-center text-xs font-bold text-green-700 select-none">
            <div className="text-3xl mb-3 animate-spin duration-1000">🌱</div>
            <p className="tracking-tight text-gray-500 animate-pulse">{statusText}</p>
        </div>
    );
}