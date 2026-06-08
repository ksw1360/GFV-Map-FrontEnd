'use client';

import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';
import FindAccountForm from './FindAccountForm';

// 현재 모달이 보여줄 화면 타입 정의
export type AuthViewMode = 'LOGIN' | 'SIGNUP' | 'FIND_ID' | 'FIND_PW';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
    const [viewMode, setViewMode] = useState<AuthViewMode>('LOGIN');

    if (!isOpen) return null;

    // 상태(viewMode)에 따라 렌더링할 내부 폼 스위칭
    const renderForm = () => {
        switch (viewMode) {
            case 'LOGIN':
                return <LoginForm setViewMode={setViewMode} onClose={onClose} onLoginSuccess={onLoginSuccess}/>;
            case 'SIGNUP':
                return <SignUpForm setViewMode={setViewMode} />;
            case 'FIND_ID':
                return <FindAccountForm mode="ID" setViewMode={setViewMode} />;
            case 'FIND_PW':
                return <FindAccountForm mode="PW" setViewMode={setViewMode} />;
            default:
                return <LoginForm setViewMode={setViewMode} onClose={onClose} onLoginSuccess={onLoginSuccess}/>;
        }
    };

    return (
        // 배경 어두운 영역 (Dim)
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            {/* 모달 창 본체 */}
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-6 overflow-y-auto max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">

                {/* 우측 상단 닫기 버튼 [X] */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="모달 닫기"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* 조건별 폼 동적 렌더링 영역 */}
                {renderForm()}
            </div>
        </div>
    );
}