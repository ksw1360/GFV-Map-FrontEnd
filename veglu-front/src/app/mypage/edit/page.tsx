'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function MyPageEdit() {
    const router = useRouter();

    // 💡 [추가] Next.js SSR 뼈대 불일치(Hydration Mismatch) 방지 안전 마운트 스위치
    const [isMounted, setIsMounted] = useState(false);

    // 1. 와이어프레임 우측: 레이어 모달 제어 트리거 스위치
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [isEmojiListOpen, setIsEmojiListOpen] = useState(false); // Frame 13 리스트 창

    // 2. 🎯 [실물 데이터 매핑] 초기값 가드 처리 후 useEffect에서 채워 넣기
    const [email, setEmail] = useState(''); // [로그인한 이메일] 상태 전환
    const [nickname, setNickname] = useState(''); // [닉네임]
    const [bio, setBio] = useState(''); // [자기소개]
    const [avatar, setAvatar] = useState('default'); // [프로필 이미지]

    // PC 파일 업로드 컴포넌트 제어용 리액트 훅
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Frame 13: 비건과 관련된 이모티콘 리스트 후보군
    const veganEmojis = ['🥑', '🍞', '🥦', '🥕', '🍰', '🍪'];

    // ──────────────────────────────────────────────────────────
    // 🔄 로그인 시 금고(localStorage)에 동기화해 둔 실제 유저 데이터 인계
    // ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedEmail = localStorage.getItem('user_email') || 'vegan_user@domain.com'; // 이메일 보관 처리가 있다면 연동
            const savedNickname = localStorage.getItem('user_nickname');
            const savedBio = localStorage.getItem('user_bio');
            const savedAvatar = localStorage.getItem('user_avatar');

            setEmail(savedEmail);

            // undefined 문자열 오염 차단 안전벨트 가드 가동
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

            setIsMounted(true); // 브라우저 준비 완료
        }
    }, []);
    // ──────────────────────────────────────────────────────────

    // [기본 이미지 선택] 분기 처리
    const handleOpenEmojiList = () => {
        setIsEmojiListOpen(true);
    };

    // 이모티콘 리스트에서 캐릭터 선택 즉시 아바타 상태 갱신 및 모달 닫기
    const handleSelectEmoji = (emoji: string) => {
        setAvatar(emoji); // 즉시 반영
        setIsEmojiListOpen(false);
        setIsAvatarModalOpen(false);
    };

    // [파일 업로드] 분기 처리 -> PC 이미지 파일 불러오는 탐색기 창 열기
    const handleFileTrigger = () => {
        fileInputRef.current?.click();
    };

    // PC 내 이미지 파일 선택 완료 시 다이렉트로 아바타 소스 갱신
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string); // 즉시 반영
                setIsAvatarModalOpen(false);
            };
            reader.readAsDataURL(file);
        }
    };

    // ──────────────────────────────────────────────────────────
    // 🛠️ 하단 [수정/저장] 버튼 작동 핸들러 (실물 데이터 동기화 리팩터링)
    // ──────────────────────────────────────────────────────────
    const handleSaveSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nickname.trim()) {
            alert('닉네임을 입력해 주세요!');
            return;
        }

        try {
            // 💡 [선택 구현] 나중에 백엔드와 마이페이지 회원 정보 수정 API 연동 시 주석 해제하여 연동하세요.
            const accessToken = localStorage.getItem('accessToken');
            const response = await fetch('http://192.168.7.120:5000/user/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    nickname: nickname,
                    bio: bio,
                    profileImageUrl: avatar
                })
            });
            if (!response.ok) throw new Error('서버 수정 실패');

            // 금고 최신 정보로 덮어쓰기 완료
            localStorage.setItem('user_nickname', nickname);
            localStorage.setItem('user_bio', bio);
            localStorage.setItem('user_avatar', avatar);

            alert('✅ 회원 정보 수정이 완료되었습니다.');

            // 0.1초의 짧은 타이밍 딜레이 버퍼를 준 뒤 리프레시 이동하여 마이페이지 데이터 강제 동기화
            setTimeout(() => {
                window.location.href = '/mypage';
            }, 100);

        } catch (err) {
            alert('회원 정보 수정 중 오류가 발생했습니다.');
        }
    };

    // 마운트 전 빈 공간 표출 가드로 무분별한 텍스트 튕김 이슈 차단
    if (!isMounted) {
        return <div className="min-h-screen w-screen bg-gray-50 flex items-center justify-center p-6" />;
    }

    return (
        <div className="min-h-screen w-screen bg-gray-50 flex flex-col items-center justify-center p-6 select-none relative">

            {/* PC 내의 이미지 파일을 불러오는 숨겨진 시스템 인프라 채널 */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />

            {/* 왼쪽 와이어프레임 본체 카드 구역 */}
            <form
                onSubmit={handleSaveSubmit}
                className="w-full max-w-sm bg-white border border-gray-200 rounded-3xl shadow-xl p-8 space-y-5 relative animate-in fade-in duration-200"
            >
                <div className="text-center pb-2">
                    <h2 className="text-lg font-bold text-gray-900">회원 정보 수정</h2>
                </div>

                {/* 예상 프로필 사진 (클릭 시 이미지 업로드 모달 출력) */}
                <div className="flex flex-col items-center justify-center">
                    <button
                        type="button"
                        onClick={() => setIsAvatarModalOpen(true)}
                        className="w-24 h-24 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center overflow-hidden shadow-inner relative group hover:brightness-95 transition-all"
                    >
                        {avatar === 'default' || !avatar ? (
                            <span className="text-4xl">🥑</span>
                        ) : avatar.startsWith('data:image') || avatar.startsWith('http') ? (
                            <img src={avatar} alt="업로드 이미지" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl">{avatar}</span>
                        )}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                            변경 📸
                        </div>
                    </button>
                </div>

                {/* 구성요소 1: 로그인한 이메일 (disabled 고정) */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 block">로그인한 이메일</label>
                    <input
                        type="email"
                        value={email}
                        disabled
                        className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 text-gray-400 rounded-xl text-xs font-semibold cursor-not-allowed select-none focus:outline-none shadow-inner"
                    />
                </div>

                {/* 구성요소 2: 닉네임 */}
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

                {/* 구성요소 3: 자기소개 */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 block">자기소개</label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        maxLength={85}
                        className="w-full h-24 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none text-xs text-gray-600 leading-relaxed resize-none"
                    />
                </div>

                {/* 하단 배치: 취소 및 저장(수정) 버튼 */}
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
            </form>

            {/* 이미지 업로드 컴포넌트(모달) */}
            {isAvatarModalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-in fade-in duration-100">
                    <div className="w-full max-w-xs bg-white border border-gray-100 rounded-3xl shadow-2xl p-6 space-y-4 relative text-center animate-in fade-in zoom-in-95 duration-100">

                        <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase">이미지 업로드 컴포넌트(모달)</h3>

                        <div className="flex flex-col space-y-2 text-xs font-semibold pt-2">
                            <button
                                type="button"
                                onClick={handleOpenEmojiList}
                                className="w-full py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl transition-all"
                            >
                                기본 이미지 선택
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

            {/* 우측 기획: Frame 13 비건과 관련된 이모티콘 리스트 창 */}
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

        </div>
    );
}