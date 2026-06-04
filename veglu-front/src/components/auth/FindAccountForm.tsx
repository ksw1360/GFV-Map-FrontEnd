'use client';

import React, { useState } from 'react';
import { AuthViewMode } from './AuthModal';

interface FindAccountFormProps {
    mode: 'ID' | 'PW';
    setViewMode: (mode: AuthViewMode) => void;
}

export default function FindAccountForm({ mode, setViewMode }: FindAccountFormProps) {
    const [step, setStep] = useState(1); // 1: 정보입력/인증발송, 2: 결과인증완료
    const [inputVal, setInputVal] = useState('');
    const [code, setCode] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false);

    // 비동기 전송 상태 관리
    const [isLoading, setIsLoading] = useState(false);

    // 서버 오류 및 검증 실패 메시지를 실시간 출력할 에러 상태 변수
    const [error, setError] = useState<string | null>(null);

    // ★ 비밀번호 직접 재설정 시 타이핑 값을 제어할 상태 추가
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // [1단계-A] 인증번호 발송 비동기 통신
    const handleSendCode = async () => {
        setError(null);
        if (!inputVal) return alert('정보를 입력해 주세요.');

        setIsLoading(true);
        try {
            // mode가 ID인가 PW인가에 따라 엔드포인트를 분기합니다.
            const url = mode === 'ID'
                ? 'http://localhost:8080/api/v1/auth/find-id/request'
                : 'http://localhost:8080/api/v1/auth/password/reset-request';

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    // ID 찾기 시 'phoneNumber' 필드 혹은 PW 찾기 시 'email' 필드로 조율 가능
                    [mode === 'ID' ? 'phoneNumber' : 'email']: inputVal
                })
            });

            if (!response.ok) {
                setError(mode === 'ID' ? '등록되지 않은 정보입니다.' : '존재하지 않는 회원 이메일입니다.');
                setIsLoading(false);
                return;
            }

            setIsCodeSent(true);
            alert('인증번호가 발송되었습니다. (가상 제한시간 3:00 적용)');

        } catch (err) {
            setError('인증 통신 중 서버 에러가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    // [1단계-B] 발송된 인증번호 검증 및 승인 POST 통신
    const handleVerifySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!code) return alert('인증번호를 입력해주세요.');

        setIsLoading(true);
        try {
            const url = mode === 'ID'
                ? 'http://localhost:8080/api/v1/auth/find-id/verify'
                : 'http://localhost:8080/api/v1/auth/password/verify-code';

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    [mode === 'ID' ? 'phoneNumber' : 'email']: inputVal,
                    code: code
                })
            });

            if (!response.ok) {
                setError('인증번호가 올바르지 않거나 만료되었습니다.');
                setIsLoading(false);
                return;
            }

            // 인증 통과 시 서버 응답 객체 파싱 (아이디 마스킹 텍스트 수신 목적)
            const data = await response.json();
            if (mode === 'ID' && data.email) {
                // 서버가 준 진짜 마스킹 이메일("veg***@email.com")을 인풋 상태에 백업
                setInputVal(data.email);
            }

            setStep(2); // 다음 스냅샷 비밀번호 입력/결화 화면으로 스위칭
        } catch (err) {
            setError('인증 확인 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    // [2단계-★핵심] 직접 비밀번호 변경 완료 폼 처리 및 PATCH/PUT 통신
    const handleResetPasswordSubmit = async () => {
        setError(null);

        if (!newPassword.trim() || !confirmPassword.trim()) {
            setError('새 비밀번호를 모두 입력해 주세요.');
            return;
        }

        // 프론트엔드 안전벨트 검증: 두 입력값이 일치하는지 비교
        if (newPassword !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다. 다시 확인해 주세요.');
            return;
        }

        setIsLoading(true);
        try {
            // 임시 번호 발급이 아닌 화면에서 사용자가 직접 재설정한 비밀번호 전송
            const response = await fetch('http://localhost:8080/api/v1/auth/password/reset', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: inputVal,
                    newPassword: newPassword
                })
            });

            if (!response.ok) {
                setError('비밀번호 재설정에 실패했습니다. 다시 인증해 주세요.');
                setIsLoading(false);
                return;
            }

            alert('비밀번호가 성공적으로 재설정되었습니다. 새 비밀번호로 로그인해 주세요.');
            setViewMode('LOGIN'); // 성공했으므로 정석대로 로그인 첫창 복귀

        } catch (err) {
            setError('비밀번호 변경 처리 중 서버 에러가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className="text-center mb-6">
                <h1 className="text-xl font-bold text-gray-900">
                    {mode === 'ID' ? '아이디 찾기' : '비밀번호 재설정'}
                </h1>
                <p className="text-xs text-gray-400 mt-1">인증을 위해 정보를 입력해주세요.</p>
            </div>

            {/* 실시간 오류 전용 경고 배너 렌더링 구역 */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl animate-in fade-in duration-150">
                    <p className="text-xs font-semibold text-red-600 flex items-center">
                        <span className="mr-1.5">⚠️</span> {error}
                    </p>
                </div>
            )}

            {step === 1 ? (
                <form onSubmit={handleVerifySubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            {mode === 'ID' ? '이메일 또는 전화번호' : '아이디(이메일)'}
                        </label>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={inputVal}
                                onChange={(e) => setInputVal(e.target.value)}
                                disabled={isLoading}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-green-600 font-medium"
                                placeholder="정보 입력"
                            />
                            <button
                                type="button"
                                onClick={handleSendCode}
                                disabled={isLoading}
                                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 rounded-xl text-xs font-medium transition-colors"
                            >
                                발송
                            </button>
                        </div>
                    </div>

                    {isCodeSent && (
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">인증번호 입력</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    disabled={isLoading}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm pr-12 focus:outline-none"
                                    placeholder="6자리 숫자"
                                />
                                <span className="absolute right-3 top-2.5 text-xs text-red-500 font-mono">03:00</span>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition-all"
                    >
                        {isLoading ? '검증 통신 중...' : '인증 확인'}
                    </button>
                </form>
            ) : (
                /* 2단계: 인증 성공 이후 노출 화면 조각 */
                <div className="text-center space-y-4">
                    <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-700">
                        {mode === 'ID' ? (
                            // 가짜 하드코딩이 아닌 서버 응답 데이터로 마스킹 값 동적 치환
                            <p>귀하의 아이디는 <strong className="text-blue-600">{inputVal}</strong> 입니다.</p>
                        ) : (
                            // ★ 완벽 매칭: 비밀번호 직접 재설정을 처리하는 바인딩 인풋 구역
                            <div className="space-y-3 text-left">
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="새 비밀번호 입력"
                                    disabled={isLoading}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none"
                                />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="새 비밀번호 확인"
                                    disabled={isLoading}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none"
                                />
                            </div>
                        )}
                    </div>
                    <button
                        onClick={mode === 'ID' ? () => setViewMode('LOGIN') : handleResetPasswordSubmit}
                        disabled={isLoading}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition-colors disabled:opacity-50"
                    >
                        {mode === 'ID' ? '로그인 화면으로 돌아가기' : (isLoading ? '변경 처리 중...' : '비밀번호 변경 완료')}
                    </button>
                </div>
            )}

            {step === 1 && (
                <div className="text-center mt-4">
                    <button onClick={() => setViewMode('LOGIN')} className="text-xs text-gray-400 hover:underline">
                        취소하고 로그인으로 가기
                    </button>
                </div>
            )}
        </div>
    );
}