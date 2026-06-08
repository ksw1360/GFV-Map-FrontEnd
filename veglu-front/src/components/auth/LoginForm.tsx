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
            // 🔄 [완벽 복구] 누락되었던 user_email 금고 저장 장치 재조립
            // ──────────────────────────────────────────────────────────
            if (data.accessToken) {
                // 💡 [3중 멀티 안전 가드]
                // 1. 백엔드가 최상단에 이메일을 주었을 때 (data.email)
                // 2. 혹은 user 객체 안에 감싸 주었을 때 (data.user?.email)
                // 3. 그것도 아니면 현재 유저가 이 인풋창에 직접 타이핑한 원본 상태값 (email)을 강제로 징집!
                const finalSaveEmail = data.email || data.user?.email || email || 'veglu@domain.com';

                // 🎯 제가 날려 먹었던 범인인 이메일 금고 보관 코드를 다시 굳건히 심어줍니다.
                localStorage.setItem('user_email', finalSaveEmail);

                localStorage.setItem('accessToken', data.accessToken);
                if (data.refreshToken) {
                    localStorage.setItem('refreshToken', data.refreshToken);
                }

                const finalNickname = data.nickname || data.user?.nickname || '익명유저';
                const finalAvatar = data.profileImageUrl || data.user?.profileImageUrl || 'default';

                localStorage.setItem('user_nickname', finalNickname);
                localStorage.setItem('user_avatar', finalAvatar);
            }
            // ──────────────────────────────────────────────────────────

            if (onLoginSuccess) {
                onLoginSuccess();
            }

            window.location.href = '/';

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