'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';

export default function IntegratedSocialAuthCallbackPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();

    const [statusText, setStatusText] = useState('소셜 보안 인증 세션을 조립 중입니다...');
    const hasCalled = useRef(false); // 🛡️ 중복 호출(Strict Mode 일회성 통행증 유실) 완전 방어 가드

    useEffect(() => {
        // 주소창에서 인가 코드(code)와 네이버용 상태(state) 징집
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        // 폴더 주소 [provider] 자리에 들어오는 단어(kakao, naver, google) 동적 인식
        const rawProvider = params?.provider;
        const provider = Array.isArray(rawProvider) ? rawProvider[0] : rawProvider;

        // 필수 값 누락 시 메인화면 방출 안전장치
        if (!provider || !code) {
            router.push('/');
            return;
        }

        // 🛡️ 디버깅 안전 가드: 이미 통신 중이라면 중복 발사 취소
        if (hasCalled.current) return;

        const handleSocialLoginExecution = async () => {
            hasCalled.current = true; // 진입 순간 잠금 작동
            setStatusText(`🌱 ${provider.toUpperCase()} 서버와 보안 토큰을 교환 중입니다...`);

            try {
                // 단 하나의 전역 변수 백엔드 도메인 주소 수입
                const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://192.168.7.120:5000';

                console.log(`🚀 [통합 대기실] 백엔드로 찌르는 최종 엔드포인트 ➔ ${BACKEND_URL}/auth/${provider}/login`);

                // 백엔드 컨트롤러 스펙 (/auth/kakao/login, /auth/naver/login 등) 자동 매핑 호출
                const response = await fetch(`${BACKEND_URL}/auth/${provider}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code: code,
                        state: state // 네이버 로그인 대응용 변수 포함
                    })
                });

                // 404, 500, 403 에러 발생 시 스프링부트가 넘겨준 원인 메시지를 파싱합니다.
                if (!response.ok) {
                    const errorResponseText = await response.text();
                    throw new Error(`[서버 에러 ${response.status}] 내용: ${errorResponseText}`);
                }

                // 🎯 백엔드 실물 유저 데이터 Dto 수신
                const data = await response.json();
                console.log("✅ 백엔드 소셜 인증 데이터 매핑 성공:", data);

                if (data.accessToken) {
                    // 금고(LocalStorage) 전역 동기화 잠금장치 가동
                    localStorage.setItem('accessToken', data.accessToken);
                    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);

                    localStorage.setItem('user_email', data.email || '');
                    localStorage.setItem('user_nickname', data.nickname || '소셜유저');
                    localStorage.setItem('user_avatar', data.profileImageUrl || 'default');
                    localStorage.setItem('user_role', data.role || 'USER');

                    setStatusText('🎉 인증 완수! 비건 안심 지도로 진입합니다.');

                    // 메인 화면 지도 시스템 활성화 워프
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 500);
                } else {
                    throw new Error('인증 응답 바디 내부에 accessToken이 존재하지 않습니다.');
                }
            } catch (err) {
                console.error("🚨 소셜 통합 연동 최종 실패 원인:", err);
                setStatusText('⚠️ 인증 세션이 만료되었거나 거부되었습니다. 다시 로그인해 주세요.');
                setTimeout(() => window.location.href = '/', 2500);
            }
        };

        handleSocialLoginExecution();
    }, [searchParams, params, router]);

    return (
        <div className="min-h-screen w-screen bg-white flex flex-col items-center justify-center text-xs font-bold text-green-700 select-none">
            <div className="text-3xl mb-3 animate-spin duration-1000">🌱</div>
            <p className="tracking-tight text-gray-500 animate-pulse">{statusText}</p>
        </div>
    );
}