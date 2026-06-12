'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function MyPageEdit() {
    const router = useRouter();

    const [isMounted, setIsMounted] = useState(false);

    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [isEmojiListOpen, setIsEmojiListOpen] = useState(false);

    // 🚨 와이어프레임 컴포넌트 도면 반영: 회원탈퇴 독립 모달 상태 스위치
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

    const [email, setEmail] = useState('');
    const [nickname, setNickname] = useState('');
    const [bio, setBio] = useState('');
    const [avatar, setAvatar] = useState('default');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const veganEmojis = ['🥑', '🍞', '🥦', '🥕', '🍰', '🍪'];

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedEmail = localStorage.getItem('user_email');
            const savedNickname = localStorage.getItem('user_nickname');
            const savedBio = localStorage.getItem('user_bio');
            const savedAvatar = localStorage.getItem('user_avatar');

            if (savedEmail && savedEmail !== 'undefined' && savedEmail !== 'null' && savedEmail.trim() !== '') {
                setEmail(savedEmail);
            } else {
                setEmail('vegan_user@domain.com');
            }

            if (savedNickname && savedNickname !== 'undefined' && savedNickname !== 'null') {
                setNickname(savedNickname);
            } else {
                setNickname('익명유저');
            }

            if (savedBio && savedBio !== 'undefined' && savedBio !== 'null') {
                setBio(savedBio);
            } else {
                setBio('여기는 사용자 자기소개 텍스트가 노출되거나 수정 입력되는 공간입니다.');
            }

            if (savedAvatar && savedAvatar !== 'undefined' && savedAvatar !== 'null') {
                setAvatar(savedAvatar);
            } else {
                setAvatar('default');
            }

            setIsMounted(true);
        }
    }, []);

    const handleOpenEmojiList = () => {
        setIsEmojiListOpen(true);
    };

    const handleSelectEmoji = (emoji: string) => {
        setAvatar(emoji);
        setIsEmojiListOpen(false);
        setIsAvatarModalOpen(false);
    };

    const handleFileTrigger = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
                setIsAvatarModalOpen(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nickname.trim()) {
            alert('닉네임을 입력해 주세요!');
            return;
        }

       try {
            const accessToken = localStorage.getItem('accessToken');
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json', // 이미지도 Base64라면 JSON이 맞습니다.
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    nickname: nickname,
                    bio: bio,
                    profileImageUrl: avatar // 💡 주의: 이 값이 매우 긴 Base64라면 백엔드 DB 컬럼 타입을 TEXT/LONGTEXT로 해야 합니다.
                })
            });
    
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || '서버 수정 실패');
            }
            
            // const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/update`, {
            //     method: 'PUT',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${accessToken}`
            //     },
            //     body: JSON.stringify({
            //         nickname: nickname,
            //         bio: bio,
            //         profileImageUrl: avatar
            //     })
            // });
            // if (!response.ok) throw new Error('서버 수정 실패');

            localStorage.setItem('user_nickname', nickname);
            localStorage.setItem('user_bio', bio);
            localStorage.setItem('user_avatar', avatar);

            alert('✅ 회원 정보 수정이 완료되었습니다.');
            router.push('/mypage');

            setTimeout(() => {
                window.location.href = '/mypage';
            }, 100);

        } catch (err) {
            alert('회원 정보 수정 중 오류가 발생했습니다.');
        }
    };

    // 🚨 회원탈퇴 최종 집행 엔진 (백엔드 DELETE 통신 연결)
    const handleWithdrawSubmit = async () => {
        try {
            const accessToken = localStorage.getItem('accessToken');

            // 백엔드 회원탈퇴 엔드포인트 호출 (프로젝트 명세 주소 맞춰 정렬)
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/withdraw`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (!response.ok) throw new Error('회원 탈퇴 처리 실패');

            // 🧹 금고(LocalStorage) 완전 전역 청소 및 세션 리셋
            localStorage.clear();

            alert('비건 안심 지도 회원 탈퇴가 완료되었습니다. 이용해 주셔서 감사합니다.');

            // 초기 첫 로그인 스크린으로 유저를 안전하게 추방
            window.location.href = '/';
        } catch (err) {
            console.error(err);
            alert('서버와 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
        } finally {
            setIsWithdrawModalOpen(false);
        }
    };

    if (!isMounted) {
        return <div className="min-h-screen w-screen bg-gray-50 flex items-center justify-center p-6" />;
    }

    return (
        <div className="min-h-screen w-screen bg-gray-50 flex flex-col items-center justify-center p-6 select-none relative">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />

            <form
                onSubmit={handleSaveSubmit}
                className="w-full max-w-sm bg-white border border-gray-200 rounded-3xl shadow-xl p-8 space-y-5 relative animate-in fade-in duration-200"
            >
                <div className="text-center pb-2">
                    <h2 className="text-lg font-bold text-gray-900">회원 정보 수정</h2>
                </div>

                <div className="flex flex-col items-center justify-center">
                    <button
                        type="button"
                        onClick={() => setIsAvatarModalOpen(true)}
                        className="w-24 h-24 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center overflow-hidden shadow-inner relative group hover:brightness-95 transition-all"
                    >
                        {avatar && (avatar.startsWith('data:image') || avatar.startsWith('http')) ? (
                            <img src={avatar} alt="업로드 이미지" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl">
                                {avatar && !['default', 'null', 'undefined'].includes(avatar) ? avatar : '🥑'}
                            </span>
                        )}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                            변경 📸
                        </div>
                    </button>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 block">로그인한 이메일</label>
                    <input
                        type="email"
                        value={email}
                        disabled
                        className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 text-gray-400 rounded-xl text-xs font-semibold cursor-not-allowed select-none focus:outline-none shadow-inner"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 block">닉네임</label>
                    <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        maxLength={12}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none text-xs text-gray-800 font-medium"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 block">자기소개</label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        maxLength={85}
                        className="w-full h-24 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none text-xs text-gray-600 leading-relaxed resize-none"
                    />
                </div>

                <div className="flex space-x-3 pt-2">
                    <button
                        type="button"
                        onClick={() => router.push('/mypage')}
                        className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium rounded-xl text-xs transition-colors border border-gray-200 text-center"
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        className="flex-1 py-3 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl text-xs transition-colors text-center shadow-md"
                    >
                        수정
                    </button>
                </div>

                {/* 🚨 피그마 와이어프레임 설계 기획 반영: 최하단 잔잔한 탈퇴 링크 가동 */}
                <div className="text-center pt-2">
                    <button
                        type="button"
                        onClick={() => setIsWithdrawModalOpen(true)}
                        className="text-[11px] font-semibold text-gray-400 hover:text-red-500 hover:underline transition-colors"
                    >
                        회원 탈퇴하기
                    </button>
                </div>
            </form>

            {/* 🚨 피그마 도면 연동: 독립 모달 창 구조 기믹 (오버레이) */}
            {isWithdrawModalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
                    <div className="w-full max-w-xs bg-white border border-gray-200 rounded-3xl shadow-2xl p-6 space-y-4 relative animate-in fade-in zoom-in-95 duration-150 text-center">

                        {/* 와이어프레임 명세 가이드 지침: [X] 닫기 버튼 배치 */}
                        <button
                            type="button"
                            onClick={() => setIsWithdrawModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors text-sm font-bold focus:outline-none"
                        >
                            ✕
                        </button>

                        <div className="space-y-2 pt-2">
                            <h3 className="text-sm font-bold text-gray-900">정말 탈퇴하시겠습니까?</h3>
                            <p className="text-[11px] font-medium text-gray-400 leading-relaxed">
                                회원 탈퇴 시 기존의 즐겨찾기 식당 목록 및 작성하신 모든 안심 리뷰 데이터가 영구히 소멸되며 복구할 수 없습니다.
                            </p>
                        </div>

                        <div className="flex space-x-2.5 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsWithdrawModalOpen(false)}
                                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-xl text-xs transition-colors"
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={handleWithdrawSubmit}
                                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                            >
                                탈퇴 확정
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 프로필 이미지 선택 모달 */}
            {isAvatarModalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-in fade-in duration-100">
                    <div className="w-full max-w-xs bg-white border border-gray-100 rounded-3xl shadow-2xl p-6 space-y-4 relative text-center animate-in fade-in zoom-in-95 duration-100">
                        <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase">이미지 업로드 컴포넌트(모달)</h3>
                        <div className="flex flex-col space-y-2 text-xs font-semibold pt-2">
                            {/* 기본 이모지 선택 버튼 주석 처리 */}
                            {/*
                            <button
                                type="button"
                                onClick={handleOpenEmojiList}
                                className="w-full py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl transition-all"
                            >
                                기본 이미지 선택
                            </button>
                            */}
                            <button
                                type="button"
                                onClick={() => {
                                    setAvatar('default');
                                    setIsAvatarModalOpen(false);
                                }}
                                className="w-full py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl transition-all"
                            >
                                기본 이미지로 변경
                            </button>
                            <button
                                type="button"
                                onClick={handleFileTrigger}
                                className="w-full py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl transition-all"
                            >
                                파일 업로드
                            </button>
                        </div>
                        <div className="pt-2 border-t border-gray-50">
                            <button
                                type="button"
                                onClick={() => setIsAvatarModalOpen(false)}
                                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-xl text-xs font-medium"
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 이모지 리스트 모달 (주석 처리) */}
            {/*
            {isEmojiListOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-100">
                    <div className="w-full max-w-xs bg-white rounded-2xl shadow-2xl p-5 space-y-3 animate-in fade-in zoom-in-95 duration-100">
                        <div className="text-center border-b border-gray-100 pb-2">
                            <h4 className="text-xs font-bold text-gray-700">이미지 리스트</h4>
                        </div>
                        <div className="grid grid-cols-3 gap-2 py-1 justify-items-center">
                            {veganEmojis.map((emoji) => (
                                <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => handleSelectEmoji(emoji)}
                                    className="w-14 h-14 flex items-center justify-center text-2xl bg-gray-50 border border-gray-100 rounded-xl hover:bg-green-50 hover:border-green-400 transition-all active:scale-90"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsEmojiListOpen(false)}
                            className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-medium text-gray-500"
                        >
                            뒤로가기
                        </button>
                    </div>
                </div>
            )}
            */}
        </div>
    );
}
