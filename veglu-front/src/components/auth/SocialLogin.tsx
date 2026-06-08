'use client';

import React from 'react';

export default function SocialLogin() {

    const handleSocialRedirect = (provider: 'kakao' | 'naver' | 'google') => {
        let redirectUrl = '';

        if (provider === 'kakao') {
            const KAKAO_CLIENT_ID = process.env.NEXT_PUBLIC_RAW_KAKAO_CLIENT_ID;
            const KAKAO_REDIRECT_URI = process.env.NEXT_PUBLIC_RAW_KAKAO_REDIRECT_URI;

            if (!KAKAO_CLIENT_ID || !KAKAO_REDIRECT_URI) {
                console.error("🚨 [보안 가드] .env.local 파일에 카카오 API 정보가 누락되었습니다.");
                alert("현재 카카오 로그인 시스템 점검 중입니다.");
                return;
            }

            redirectUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(KAKAO_REDIRECT_URI)}`;
        }

        else if (provider === 'naver') {
            const NAVER_CLIENT_ID = process.env.NEXT_PUBLIC_RAW_NAVER_CLIENT_ID;
            const NAVER_REDIRECT_URI = process.env.NEXT_PUBLIC_RAW_NAVER_REDIRECT_URI;
            const STATE = process.env.NEXT_PUBLIC_RAW_NAVER_STATE;

            if (!NAVER_CLIENT_ID || !NAVER_REDIRECT_URI) {
                console.error("🚨 [보안 가드] .env.local 파일에 네이버 API 정보가 누락되었습니다.");
                alert("현재 네이버 로그인 시스템 점검 중입니다.");
                return;
            }

            redirectUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${encodeURIComponent(NAVER_REDIRECT_URI)}&state=${STATE}`;
        }

        else if (provider === 'google') {
            const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_RAW_GOOGLE_CLIENT_ID;
            const GOOGLE_REDIRECT_URI = process.env.NEXT_PUBLIC_RAW_GOOGLE_REDIRECT_URI;
            const SCOPE = process.env.NEXT_PUBLIC_RAW_GOOGLE_SCOPE;

            if (!GOOGLE_CLIENT_ID || !GOOGLE_REDIRECT_URI || !SCOPE) {
                console.error("🚨 [보안 가드] .env.local 파일에 구글 API 정보가 누락되었습니다.");
                alert("현재 구글 로그인 시스템 점검 중입니다.");
                return;
            }

            redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&scope=${encodeURIComponent(SCOPE)}`;
        }

        // 안전하게 환경 변수 조립된 소셜 동의창 주소로 즉시 이동
        if (redirectUrl) {
            window.location.href = redirectUrl;
        }
    };

    return (
        <div>
            <div className="relative my-5 text-center">
                <hr className="border-gray-200" />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 bg-white text-xs text-gray-400">
                    소셜 계정 로그인
                </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
                <button
                    type="button"
                    onClick={() => handleSocialRedirect('kakao')}
                    className="flex items-center justify-center py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-xs font-medium transition-colors"
                >
                    카카오
                </button>
                <button
                    type="button"
                    onClick={() => handleSocialRedirect('naver')}
                    className="flex items-center justify-center py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-xs font-medium transition-colors"
                >
                    네이버
                </button>
                <button
                    type="button"
                    onClick={() => handleSocialRedirect('google')}
                    className="flex items-center justify-center py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-xs font-medium transition-colors"
                >
                    구글
                </button>
            </div>
        </div>
    );
}