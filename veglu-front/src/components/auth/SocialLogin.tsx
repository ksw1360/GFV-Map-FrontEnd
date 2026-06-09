// 'use client';
//
// import React, { useEffect, useState } from 'react';
//
// export default function SocialLogin() {
//     // 하이드레이션(서버-프론트 균열) 방지 및 환경변수 로드 상태 확인용 마운트 체크
//     const [isMounted, setIsMounted] = useState(false);
//
//     useEffect(() => {
//         setIsMounted(true);
//     }, []);
//
//     // 🟡 환경 변수 금고에서 카카오 정보 징집
//     const KAKAO_CLIENT_ID = process.env.NEXT_PUBLIC_RAW_KAKAO_CLIENT_ID;
//     const KAKAO_REDIRECT_URI = process.env.NEXT_PUBLIC_RAW_KAKAO_REDIRECT_URI;
//
//     // 🟢 환경 변수 금고에서 네이버 정보 징집
//     const NAVER_CLIENT_ID = process.env.NEXT_PUBLIC_RAW_NAVER_CLIENT_ID;
//     const NAVER_REDIRECT_URI = process.env.NEXT_PUBLIC_RAW_NAVER_REDIRECT_URI;
//     const NAVER_STATE = process.env.NEXT_PUBLIC_RAW_NAVER_STATE || 'vegan_gf_map_state';
//
//     // 🔵 환경 변수 금고에서 구글 정보 징집
//     const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_RAW_GOOGLE_CLIENT_ID;
//     const GOOGLE_REDIRECT_URI = process.env.NEXT_PUBLIC_RAW_GOOGLE_REDIRECT_URI;
//     const GOOGLE_SCOPE = process.env.NEXT_PUBLIC_RAW_GOOGLE_SCOPE || 'email profile';
//
//     // 마운트 전에는 레이아웃 깨짐을 방지하기 위해 빈 껍데기 반환
//     if (!isMounted) return null;
//
//     // 🛡️ API 키 누락 방어용 보안 가드 검사
//     const handleGuardAlert = (provider: string) => {
//         console.error(`🚨 [보안 가드] .env.local 파일에 [${provider}] OAuth API 스펙 정보가 누락되었습니다.`);
//         alert(`현재 ${provider} 로그인 시스템 점검 중입니다. 잠시 후 다시 시도해 주세요.`);
//     };
//
//     return (
//         <div>
//             <div className="relative my-5 text-center">
//                 <hr className="border-gray-200" />
//                 <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 bg-white text-xs text-gray-400">
//                     소셜 계정 로그인
//                 </span>
//             </div>
//
//             <div className="grid grid-cols-3 gap-2">
//
//                 {/* 🟡 카카오 관문 (.env 동기화 완료) */}
//                 {KAKAO_CLIENT_ID && KAKAO_REDIRECT_URI ? (
//                     <a
//                         href={`https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(KAKAO_REDIRECT_URI)}`}
//                         className="flex items-center justify-center py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-xs font-medium transition-colors text-center text-gray-700 active:scale-[0.98]"
//                     >
//                         카카오
//                     </a>
//                 ) : (
//                     <button
//                         type="button"
//                         onClick={() => handleGuardAlert('카카오')}
//                         className="flex items-center justify-center py-2 border border-gray-200 rounded-xl hover:bg-red-50 text-xs font-medium transition-colors text-center text-red-400"
//                     >
//                         카카오 ⚠️
//                     </button>
//                 )}
//
//                 {/* 🟢 네이버 관문 (.env 동기화 완료) */}
//                 {NAVER_CLIENT_ID && NAVER_REDIRECT_URI ? (
//                     <a
//                         href={`https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${encodeURIComponent(NAVER_REDIRECT_URI)}&state=${NAVER_STATE}`}
//                         className="flex items-center justify-center py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-xs font-medium transition-colors text-center text-gray-700 active:scale-[0.98]"
//                     >
//                         네이버
//                     </a>
//                 ) : (
//                     <button
//                         type="button"
//                         onClick={() => handleGuardAlert('네이버')}
//                         className="flex items-center justify-center py-2 border border-gray-200 rounded-xl hover:bg-red-50 text-xs font-medium transition-colors text-center text-red-400"
//                     >
//                         네이버 ⚠️
//                     </button>
//                 )}
//
//                 {/* 🔵 구글 관문 (.env 동기화 완료) */}
//                 {GOOGLE_CLIENT_ID && GOOGLE_REDIRECT_URI ? (
//                     <a
//                         href={`https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&scope=${encodeURIComponent(GOOGLE_SCOPE)}`}
//                         className="flex items-center justify-center py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-xs font-medium transition-colors text-center text-gray-700 active:scale-[0.98]"
//                     >
//                         구글
//                     </a>
//                 ) : (
//                     <button
//                         type="button"
//                         onClick={() => handleGuardAlert('구글')}
//                         className="flex items-center justify-center py-2 border border-gray-200 rounded-xl hover:bg-red-50 text-xs font-medium transition-colors text-center text-red-400"
//                     >
//                         구글 ⚠️
//                     </button>
//                 )}
//
//             </div>
//         </div>
//     );
// }

'use client';

import React from 'react';

export default function SocialLogin() {
    // 프론트엔드 자신의 도메인 주소 (콘솔 설정에 등록된 Callback URL 주소)
    const FRONTEND_URL = 'http://localhost:3000';

    // 🟡 카카오 상숫값 정의
    const KAKAO_CLIENT_ID = '5cbb4b90ecb89c2feefea4ade7ed1db0';
    const KAKAO_REDIRECT_URI = `${FRONTEND_URL}/auth/kakao/callback`;

    // 🟢 네이버 상숫값 정의
    const NAVER_CLIENT_ID = 'k5TSkkHC8gIfT9M15ECc';
    const NAVER_REDIRECT_URI = `${FRONTEND_URL}/auth/naver/callback`;
    const NAVER_STATE = 'vegan_gf_map_state';

    // 🔵 구글 상숫값 정의
    const GOOGLE_CLIENT_ID = '332714059523-bh6db7jsaabpmf6fvvtahjal0fhfqa5u.apps.googleusercontent.com';
    const GOOGLE_REDIRECT_URI = `${FRONTEND_URL}/auth/google/callback`;
    const GOOGLE_SCOPE = 'email profile';

    return (
        <div>
            <div className="relative my-5 text-center">
                <hr className="border-gray-200" />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 bg-white text-xs text-gray-400">
                    소셜 계정 로그인
                </span>
            </div>

            <div className="grid grid-cols-3 gap-2">

                {/* 🟡 카카오 -> 동의 완료 후 프론트 대기실(:3000)로 통행증(code) 발송 */}
                <a
                    href={`https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(KAKAO_REDIRECT_URI)}`}
                    className="flex items-center justify-center py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-xs font-medium transition-colors text-center text-gray-700"
                >
                    카카오
                </a>

                {/* 🟢 네이버 -> 동의 완료 후 프론트 대기실(:3000)로 통행증(code) 발송 */}
                <a
                    href={`https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${encodeURIComponent(NAVER_REDIRECT_URI)}&state=${NAVER_STATE}`}
                    className="flex items-center justify-center py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-xs font-medium transition-colors text-center text-gray-700"
                >
                    네이버
                </a>

                {/* 🔵 구글 -> 동의 완료 후 프론트 대기실(:3000)로 통행증(code) 발송 */}
                <a
                    href={`https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&scope=${encodeURIComponent(GOOGLE_SCOPE)}`}
                    className="flex items-center justify-center py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-xs font-medium transition-colors text-center text-gray-700"
                >
                    구글
                </a>

            </div>
        </div>
    );
}