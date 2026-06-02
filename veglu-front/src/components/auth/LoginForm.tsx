'use client';

import React, { useState } from 'react';
// ★ [A방법 반영] 이미 완벽하게 수선된 진짜 소셜 로그인 컴포넌트를 가져옵니다.
import SocialLogin from './SocialLogin';

interface LoginFormProps {
    setViewMode: (mode: 'LOGIN' | 'SIGNUP' | 'FIND_ID' | 'FIND_PW') => void;
    onClose: () => void;
}

export default function LoginForm({ setViewMode, onClose }: LoginFormProps) {
    // 입력 필드 상태 관리
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // 실제 백엔드 검증 실패 문구 출력용 에러 상태
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email.trim() || !password.trim()) {
            setError('이메일과 비밀번호를 모두 입력해 주세요.');
            return;
        }

        setIsLoading(true);

        try {
            // 1. 순수 fetch API 방식을 활용한 실제 백엔드 서버 값 검증 요청
            const response = await fetch('http://192.168.7.120:5000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });

            // 2. 검증 실패 시 "이메일 또는 비밀번호가 다릅니다"를 setError로 출력
            if (!response.ok) {
                setError('이메일 또는 비밀번호가 다릅니다.');
                setIsLoading(false);
                return;
            }

            // 로그인 성공 시 응답 데이터(JWT 토큰 및 세션) 파싱 후 로컬 저장소 안착
            const data = await response.json();
            if (data.accessToken) {
                localStorage.setItem('user_token', data.accessToken);
                localStorage.setItem('user_nickname', data.user?.nickname || '위치삼');
                localStorage.setItem('user_avatar', data.user?.avatar || '🥑');
            }

            // 성공 완료 후 부모 모달 종료
            onClose();

        } catch (err) {
            setError('서버 연결에 실패했습니다. 네트워크 상태를 확인해 주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    // ──────────────────────────────────────────────────────────
    // ✂️ [중복 도려냄] 가짜 Key가 들어있던 handleSocialLogin 함수는
    // 이제 독립된 <SocialLogin /> 컴포넌트가 완벽히 전담하므로 삭제했습니다.
    // ──────────────────────────────────────────────────────────

    return (
        <div className="w-full space-y-5 text-xs select-none">

            {/* 1. 일반 이메일 로그인 폼 트랙 */}
            <form onSubmit={handleSubmit} className="space-y-4 w-full">
                <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-400 block">이메일 주소</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@domain.com"
                        disabled={isLoading}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-all font-medium text-gray-800"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-400 block">비밀번호</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={isLoading}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-all text-gray-800"
                    />
                </div>

                {/* setError 작동 시 출력되는 에러 경고 배너 */}
                {error && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl animate-in fade-in duration-150">
                        <p className="text-[11px] font-semibold text-red-600 flex items-center">
                            <span className="mr-1.5">⚠️</span> {error}
                        </p>
                    </div>
                )}

                <div className="pt-1">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl transition-all shadow-md active:scale-[0.99]"
                    >
                        {isLoading ? '인증 정보 검증 중...' : '비건 안심 지도 로그인'}
                    </button>
                </div>
            </form>

            {/* 2. 아이디/비번 찾기 및 회원가입 내비게이션 링크 트랙*/}
            <div className="flex items-center justify-center space-x-3 text-gray-400 font-medium border-b border-gray-100 pb-4">
                <button
                    type="button"
                    onClick={() => setViewMode('FIND_ID')}
                    className="hover:text-gray-600 transition-colors bg-transparent border-none p-0 cursor-pointer"
                >
                    아이디 찾기
                </button>
                <span className="text-gray-200">|</span>
                <button
                    type="button"
                    onClick={() => setViewMode('FIND_PW')}
                    className="hover:text-gray-600 transition-colors bg-transparent border-none p-0 cursor-pointer"
                >
                    비밀번호 찾기
                </button>
                <span className="text-gray-200">|</span>
                <button
                    type="button"
                    onClick={() => setViewMode('SIGNUP')}
                    className="text-green-700 font-bold hover:underline bg-transparent border-none p-0 cursor-pointer"
                >
                    회원가입
                </button>
            </div>
            <SocialLogin />

        </div>
    );
}