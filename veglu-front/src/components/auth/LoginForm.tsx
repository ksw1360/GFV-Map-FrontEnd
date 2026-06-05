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
                // MainPage가 읽어가는 이름인 'accessToken', 'refreshToken' 구조로 금고 고정
                localStorage.setItem('accessToken', data.accessToken);
                if (data.refreshToken) {
                    localStorage.setItem('refreshToken', data.refreshToken);
                }

<<<<<<< HEAD
                // 백엔드 응답이 { "accessToken": "...", "nickname": "내이름" } 구조일 때의 조치
                const finalNickname = data.nickname || data.user?.nickname || '익명유저';
                const finalAvatar = data.profileImageUrl || data.user?.profileImageUrl || 'default';

                localStorage.setItem('user_nickname', finalNickname);
                localStorage.setItem('user_avatar', finalAvatar);
=======
                // 💡 [임시 데이터 박멸] 백엔드 실물 DB 유저 데이터 매핑
                // 백엔드가 내려주는 DTO 형태(철자)가 user.nickname 인지, profileImageUrl 인지
                // 팀원분 자바 코드를 보고 최종 체크해 맞추시면 됩니다.
                localStorage.setItem('user_nickname', data.user?.nickname || '익명유저');

                // 유저가 사진을 등록 안 해서 null 이나 'default'가 오더라도 안전벨트 텍스트로 임시 수입
                localStorage.setItem('user_avatar', data.user?.profileImageUrl || data.user?.avatar || 'default');
>>>>>>> teammate-repo/main
            }
            // ──────────────────────────────────────────────────────────

            // ◀ 모달을 닫아준 직후, 지도가 있는 메인 홈('/')으로 즉시 내비게이션 이동
            onClose();

            // 💡 팁: 상태 세션 변화를 감지해 헤더나 사이드바 UI를 한 번에 새로고침 렌더링하려면
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