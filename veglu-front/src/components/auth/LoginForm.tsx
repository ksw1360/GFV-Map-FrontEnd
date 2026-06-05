'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import SocialLogin from './SocialLogin';

interface LoginFormProps {
    setViewMode: (mode: 'LOGIN' | 'SIGNUP' | 'FIND_ID' | 'FIND_PW') => void;
    onClose: () => void;
}

export default function LoginForm({ setViewMode, onClose }: LoginFormProps) {
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

            if (!response.ok) {
                setError('이메일 또는 비밀번호가 다릅니다.');
                setIsLoading(false);
                return;
            }

            const data = await response.json();

            // ──────────────────────────────────────────────────────────
            // 🔄 [리팩토링 반영] MainPage의 자동 로그인 레이어와 토큰 이름 동기화
            // ──────────────────────────────────────────────────────────
            if (data.accessToken) {
                localStorage.setItem('user_email', data.email);
                localStorage.setItem('accessToken', data.accessToken);
                if (data.refreshToken) {
                    localStorage.setItem('refreshToken', data.refreshToken);
                }

                const finalNickname = data.nickname || data.user?.nickname || '익명유저';
                const finalAvatar = data.profileImageUrl || data.user?.profileImageUrl || 'default';

                localStorage.setItem('user_nickname', finalNickname);
                localStorage.setItem('user_avatar', finalAvatar);

                // 💡 [추가] 사후 검증 및 권한 체킹을 위해 유저 역할을 금고에 기록합니다.
                // 백엔드가 준 데이터 중 role 혹은 userRole 이라는 이름표를 조준합니다.
                const userRole = data.role || data.user?.role || 'USER';
                localStorage.setItem('user_role', userRole);

                // 모달을 우아하게 닫아줍니다.
                onClose();

                // ──────────────────────────────────────────────────────────
                // 🎯 [핵심 기믹] 권한(Role)에 따른 페이지 라우팅 분기 머신 격발
                // ──────────────────────────────────────────────────────────
                console.log(`🔑 로그인 성공 - 계정 권한 감지됨: ${userRole}`);

                switch (userRole.toUpperCase()) {
                    case 'OWNER':
                        // 식당 사장님인 경우 점주 전용 관리 페이지나 매장 등록 대시보드로 리다이렉트
                        console.log("🏪 점주 권한 분기 활성화 ➔ 점주 홈으로 워프");
                        window.location.href = '/owner/dashboard';
                        break;

                    case 'ADMIN':
                        // 전체 시스템 총괄 관리자인 경우 백오피스 관리자 대시보드로 리다이렉트
                        console.log("🛡️ 관리자 권한 분기 활성화 ➔ 관리자 백오피스로 워프");
                        window.location.href = '/admin/manage';
                        break;

                    case 'USER':
                    default:
                        // 일반 소비자나 기본 계정권한인 경우 우리가 완성한 안심 지도 메인 화면으로 리다이렉트
                        console.log("🌱 일반 유저 권한 분기 활성화 ➔ 안심 지도 홈으로 워프");
                        window.location.href = '/';
                        break;
                }
                return; // 분기 주소 이동을 집행했으므로 연산 조기 종료
            }
            // ──────────────────────────────────────────────────────────

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