'use client';

import React, { useState, useEffect } from 'react';
import { AuthViewMode } from './AuthModal';

interface SignUpFormProps {
    setViewMode: (mode: AuthViewMode) => void;
}

export default function SignUpForm({ setViewMode }: SignUpFormProps) {
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        nickname: '',
        password: '',
        confirmPassword: '',
        bio: ''
    });

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // ──────────────────────────────────────────────────────────
    // 🌱 이메일 및 [신규 추가] 프로필 사진 전용 상태 머신
    // ──────────────────────────────────────────────────────────
    const [emailCode, setEmailCode] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300);

    // ★ [추가] 유저가 선택한 진짜 파일 객체를 담아둘 상태 관리 장치
    const [profileFile, setProfileFile] = useState<File | null>(null);
    // ★ [추가] 선택한 사진을 화면에 둥글게 미리 보여주기(Preview) 위한 임시 URL 주소창 상태
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    // 사용자 역할 선택 변수
    const [role, setRole] = useState<'USER' | 'OWNER'>('USER');

    // 인증 유효시간 제한용 카운트다운 타이머 이펙트
    useEffect(() => {
        if (!isCodeSent || timeLeft <= 0 || isEmailVerified) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [isCodeSent, timeLeft, isEmailVerified]);

    // 초 단위를 05:00 포맷 문자열로 파싱해주는 도우미 함수
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ★ [추가] 사진 선택 상자가 변했을 때 파일 정보를 가로채는 핸들러 함수
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const pickedFile = e.target.files[0];
            setProfileFile(pickedFile); // 진짜 이미지 바이너리 저장

            // 브라우저 메모리에 가상의 가짜 URL을 따서 미리보기 화면 갱신
            const objectUrl = URL.createObjectURL(pickedFile);
            setPreviewUrl(objectUrl);
        }
    };

    // 컴포넌트가 꺼질 때 메모리 누수 방지를 위한 가비지 컬렉션 처리
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    // ──────────────────────────────────────────────────────────
    // 📩 1단계 - 이메일로 인증번호 발송 요청 API
    // ──────────────────────────────────────────────────────────
    const handleSendVerificationCode = async () => {
        setError('');
        if (!formData.email.trim()) {
            setError('인증번호를 받을 이메일 주소를 입력해 주세요.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('http://192.168.7.120:5000/auth/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email })
            });

            if (!response.ok) {
                setError('인증번호 발송에 실패했습니다. 이미 가입된 이메일인지 확인해 주세요.');
                setIsLoading(false);
                return;
            }

            setIsCodeSent(true);
            setTimeLeft(300);
            alert('입력하신 이메일로 인증번호가 발송되었습니다.');

        } catch (err) {
            setError('이메일 서버와 통신 중 문제가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    // ──────────────────────────────────────────────────────────
    // 🔑 2단계 - 유저가 친 인증번호 검증 완료 처리 API
    // ──────────────────────────────────────────────────────────
    const handleVerifyEmailCode = async () => {
        setError('');
        if (!emailCode.trim()) {
            setError('인증번호 6자리를 입력해 주세요.');
            return;
        }
        if (timeLeft <= 0) {
            setError('인증 시간이 만료되었습니다. 다시 발송해 주세요.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('http://192.168.7.120:5000/auth/email/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    code: emailCode
                })
            });

            if (!response.ok) {
                setError('인증번호가 올바르지 않거나 만료되었습니다.');
                setIsLoading(false);
                return;
            }

            setIsEmailVerified(true);
            alert('이메일 인증이 완료되었습니다. 회원가입 절차를 계속해 주세요.');

        } catch (err) {
            setError('인증 코드 검증 중 서버 에러가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    // ──────────────────────────────────────────────────────────
    // 🚀 3단계 - 최종 회원가입 완료 요청 API
    // ──────────────────────────────────────────────────────────
    const handleSignUpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!isEmailVerified) {
            setError('이메일 인증을 완료하셔야 회원가입이 가능합니다.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        setIsLoading(true);

        try {
            // ★ [리팩토링 반영] 필수항목 + Nullable 비필수 항목(전화번호, 자기소개, 프로필사진 경로)
            // 을 백엔드 자바 DTO 명세 양식에 맞춰 빈 값 가드를 쳐서 JSON 바디에 정렬 수입합니다.
            const response = await fetch('http://192.168.7.120:5000/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    code: emailCode,
                    phone: formData.phone,
                    nickname: formData.nickname,
                    password: formData.password,
                    // 사진 파일은 쌩으로 드래그해 넣을 수 없으므로, 파일 명칭 문자열만 토스하거나
                    // 비어있을 때는 정석대로 null 처리를 유도하여 백엔드 DTO 바인딩 에러를 파쇄합니다.
                    profileImageUrl: profileFile ? profileFile.name : null,
                    bio: formData.bio
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                setError(errData.message || '이미 가입된 이메일이거나 중복된 닉네임입니다.');
                setIsLoading(false);
                return;
            }

            alert('회원가입이 완료되었습니다! 로그인 화면으로 돌아갑니다.');
            setViewMode('LOGIN');

        } catch (err) {
            setError('서버와 통신하는 중 오류가 발생했습니다. 네트워크 상태를 확인해 주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className="text-center mb-6">
                <h1 className="text-xl font-bold text-gray-900">회원가입</h1>
                <p className="text-xs text-gray-400 mt-1">비건 지도 서비스의 회원이 되어보세요.</p>
            </div>

            <form onSubmit={handleSignUpSubmit} className="space-y-3">

                {/* 0. JSX에 역할 선택 라디오 버튼 추가 */}
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">회원 유형</label>
                    <div className="flex space-x-4">
                        <label className="flex items-center block text-xs font-medium text-gray-600 mb-1">
                            <input
                                type="radio" name="role" value="USER" checked={role === 'USER'}
                                onChange={() => setRole('USER')} className="mr-2"
                            /> 일반 사용자
                        </label>
                        <label className="flex items-center block text-xs font-medium text-gray-600 mb-1">
                            <input
                                type="radio" name="role" value="OWNER" checked={role === 'OWNER'}
                                onChange={() => setRole('OWNER')} className="mr-2"
                            /> 점주님
                        </label>
                    </div>
                </div>

                {/* 1. 아이디/이메일 구역 */}
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">아이디(이메일)</label>
                    <div className="flex space-x-2">
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            disabled={isLoading || isEmailVerified}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
                            placeholder="example@email.com"
                        />
                        <button
                            type="button"
                            onClick={handleSendVerificationCode}
                            disabled={isLoading || isEmailVerified}
                            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 rounded-xl text-xs font-medium transition-colors whitespace-nowrap"
                        >
                            {isCodeSent ? '재발송' : '인증요청'}
                        </button>
                    </div>
                </div>

                {/* 2. 인증번호 입력란 */}
                {isCodeSent && (
                    <div className="animate-in fade-in duration-200">
                        <label className="block text-xs font-medium text-gray-600 mb-1">인증번호 입력</label>
                        <div className="flex space-x-2">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={emailCode}
                                    onChange={(e) => setEmailCode(e.target.value)}
                                    disabled={isLoading || isEmailVerified}
                                    maxLength={6}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm pr-14 focus:outline-none text-gray-800 font-mono"
                                    placeholder="6자리 숫자"
                                />
                                {!isEmailVerified && (
                                    <span className="absolute right-3 top-2.5 text-xs text-red-500 font-bold font-mono">
                                        {formatTime(timeLeft)}
                                    </span>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={handleVerifyEmailCode}
                                disabled={isLoading || isEmailVerified}
                                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white disabled:bg-green-600 rounded-xl text-xs font-medium transition-colors whitespace-nowrap"
                            >
                                {isEmailVerified ? '✓ 완료' : '확인'}
                            </button>
                        </div>
                    </div>
                )}

                {/* 전화번호 */}
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">전화번호</label>
                    <input
                        type="text"
                        name="phone"
                        required
                        onChange={handleChange}
                        disabled={isLoading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none"
                        placeholder="010-0000-0000"
                    />
                </div>

                {/* 닉네임 */}
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">닉네임</label>
                    <input
                        type="text"
                        name="nickname"
                        required
                        onChange={handleChange}
                        disabled={isLoading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none"
                        placeholder="닉네임을 입력하세요"
                    />
                </div>

                {/* 비밀번호 */}
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">비밀번호</label>
                    <input
                        type="password"
                        name="password"
                        required
                        onChange={handleChange}
                        disabled={isLoading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none"
                        placeholder="비밀번호 입력"
                    />
                </div>

                {/* 비밀번호 확인 */}
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">비밀번호 확인</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        required
                        onChange={handleChange}
                        disabled={isLoading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none"
                        placeholder="비밀번호 재입력"
                    />
                </div>

                {/* ★ [수선 완료] 프로필 사진 업로드 및 미리보기 연동 트랙 */}
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">프로필 사진</label>
                    <div className="flex items-center space-x-3">
                        {/* 이미지가 있으면 딴 가짜 URL을 렌더링하고, 없으면 아보카도 이모지를 배치 */}
                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                        ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg shadow-inner">🥑</div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange} // 핸들러 가동
                            disabled={isLoading}
                            className="text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border file:border-gray-200 file:text-xs file:bg-white file:font-semibold hover:file:bg-gray-50 file:cursor-pointer disabled:opacity-50"
                        />
                    </div>
                </div>

                {/* 자기소개 */}
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">자기소개</label>
                    <textarea
                        name="bio"
                        rows={2}
                        onChange={handleChange}
                        disabled={isLoading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none"
                        placeholder="한 줄 자기소개를 입력하세요"
                    />
                </div>

                {error && <p className="text-xs text-red-500 font-medium animate-in fade-in duration-150">⚠️ {error}</p>}

                <button
                    type="submit"
                    disabled={isLoading || !isEmailVerified}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-xl text-sm mt-2 transition-colors disabled:opacity-60 flex items-center justify-center"
                >
                    {isLoading ? '가입 승인 대기 중...' : '회원가입 완료'}
                </button>
            </form>

            <div className="text-center mt-4">
                <button
                    onClick={() => setViewMode('LOGIN')}
                    disabled={isLoading}
                    className="text-xs text-gray-400 hover:underline disabled:opacity-50"
                >
                    이미 계정이 있으신가요? 로그인으로 가기
                </button>
            </div>
        </div>
    );
}