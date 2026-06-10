'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import SocialLogin from './SocialLogin';

interface LoginFormProps {
    setViewMode: (mode: 'LOGIN' | 'SIGNUP' | 'FIND_ID' | 'FIND_PW') => void;
    onClose: () => void;
    onLoginSuccess: () => void;
}

export default function LoginForm({ setViewMode, onClose, onLoginSuccess }: LoginFormProps) {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
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
            // 🌱 최신 환경 변수 금고에서 백엔드 기본 API 주소를 징집합니다.
            const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://192.168.7.120:5000';

            const response = await fetch(`${BACKEND_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });

            if (!response.ok) {
                setError('이메일 또는 비밀번호가 다릅니다.');
                setIsLoading(false);
                return;
            }

            const data = await response.json();

            // 🛡️ 로그인 직후 튕겨나갈 권한별 다이내믹 라우팅 기본값 세팅
            let destinationPath = '/';

            if (data.accessToken) {
                // 1. 토큰 보관
                localStorage.setItem('accessToken', data.accessToken);
                if (data.refreshToken) {
                    localStorage.setItem('refreshToken', data.refreshToken);
                }

                // 2. 유저 프로필 메타 데이터 금고 보관 (이메일 유실 방지 수호선 가동)
                const finalSaveEmail = data.email || data.user?.email || email || 'veglu@domain.com';
                const finalNickname = data.nickname || data.user?.nickname || '익명유저';
                const finalAvatar = data.profileImageUrl || data.user?.profileImageUrl || 'default';

                localStorage.setItem('user_email', finalSaveEmail);
                localStorage.setItem('user_nickname', finalNickname);
                localStorage.setItem('user_avatar', finalAvatar);

                // 3. 권한(Role) 색출 및 맞춤형 다이내믹 라우팅 분기 집행
                const userRole = data.role || data.user?.role || 'USER';
                localStorage.setItem('user_role', userRole);

                // 권한별 이동 경로 설정
                if (userRole === 'ADMIN') {
                    destinationPath = '/admin/users';
                } else if (userRole === 'OWNER') {
                    destinationPath = '/owner/dashboard';
                } else {
                    destinationPath = '/';
                }

            }

            if (onLoginSuccess) {
                onLoginSuccess();
            }

            // 확정된 권한별 타깃 주소로 유저를 안전하게 밀어넣습니다.
            window.location.href = destinationPath;

        } catch (err) {
            setError('서버 연결에 실패했습니다. 네트워크 상태를 확인해 주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full space-y-5 text-xs select-none">
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

            <div className="flex items-center justify-center space-x-3 text-gray-400 font-medium border-b border-gray-100 pb-4">
                <button type="button" onClick={() => setViewMode('FIND_ID')} className="hover:text-gray-600 transition-colors">아이디 찾기</button>
                <span className="text-gray-200">|</span>
                <button type="button" onClick={() => setViewMode('FIND_PW')} className="hover:text-gray-600 transition-colors">비밀번호 찾기</button>
                <span className="text-gray-200">|</span>
                <button type="button" onClick={() => setViewMode('SIGNUP')} className="text-green-700 font-bold hover:underline">회원가입</button>
            </div>
            <SocialLogin />
        </div>
    );
}