'use client';

import React from 'react';

export default function SocialLogin() {

    const handleSocialRedirect = (provider: 'kakao' | 'naver' | 'google') => {
        let redirectUrl = '';

        if (provider === 'kakao') {
            const KAKAO_CLIENT_ID = '5cbb4b90ecb89c2feefea4ade7ed1db0';
            const KAKAO_REDIRECT_URI = 'http://192.168.7.120:5000/auth/kakao/callback';

            redirectUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(KAKAO_REDIRECT_URI)}`;
        }

        else if (provider === 'naver') {
            const NAVER_CLIENT_ID = 'k5TSkkHC8gIfT9M15ECc';
            const NAVER_REDIRECT_URI = 'http://192.168.7.120:5000/auth/naver/callback';
            const STATE = 'vegan_gf_map_state';

            redirectUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${encodeURIComponent(NAVER_REDIRECT_URI)}&state=${STATE}`;
        }

        else if (provider === 'google') {
            const GOOGLE_CLIENT_ID = '332714059523-bh6db7jsaabpmf6fvvtahjal0fhfqa5u.apps.googleusercontent.com';
            // 목적지를 내 Next.js 콜백 페이지로 변경!
            const GOOGLE_REDIRECT_URI = 'http://localhost:3000/auth/google/callback';
            const SCOPE = 'email profile';

            redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&scope=${encodeURIComponent(SCOPE)}`;
        }

        // 안전하게 조립된 소셜 동의창 주소로 즉시 이동
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