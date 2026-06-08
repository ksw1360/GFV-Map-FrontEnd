'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MyPage() {
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

    // 로컬 저장소 값 기반 동적 바인딩 상태
    const [email, setEmail] = useState('veglu@domain.com');
    const [nickname, setNickname] = useState('익명유저');
    const [bio, setBio] = useState('여기는 사용자 자기소개 텍스트가 노출되거나 수정 입력되는 공간입니다.');
    const [avatar, setAvatar] = useState('🥑');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedEmail = localStorage.getItem('user_email');
            const savedNickname = localStorage.getItem('user_nickname');
            const savedBio = localStorage.getItem('user_bio');
            const savedAvatar = localStorage.getItem('user_avatar');

            console.log("💎 [마이페이지 로드] 금고 오리지널 데이터 체크:", { savedEmail, savedNickname });

            // 1. 이메일 유실 및 문자열 오염 차단 안전벨트
            if (savedEmail && savedEmail !== 'undefined' && savedEmail !== 'null' && savedEmail.trim() !== '') {
                setEmail(savedEmail);
            } else {
                setEmail('veglu@domain.com'); // 금고가 비었을 때의 기본 백업 주소
            }

            // 2. 닉네임 오염 방어 가드
            if (savedNickname && savedNickname !== 'undefined' && savedNickname !== 'null' && savedNickname.trim() !== '') {
                setNickname(savedNickname);
            } else {
                setNickname('비건새내기');
            }

            // 3. 자기소개 및 아바타 가드
            if (savedBio && savedBio !== 'undefined' && savedBio !== 'null' && savedBio.trim() !== '') {
                setBio(savedBio);
            }

            if (savedAvatar && savedAvatar !== 'undefined' && savedAvatar !== 'null' && savedAvatar.trim() !== '') {
                setAvatar(savedAvatar);
            }
        }
    }, []); // 💡 중복 덮어쓰기 코드 구간을 과감히 철거하여 1회만 순수 정착시킵니다.
    // ──────────────────────────────────────────────────────────

    const mockPhotos = [
        { id: 1, title: '이태원 비건 도넛 🍩', url: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80' },
        { id: 2, title: '속 편한 쌀 소금빵 🥐', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80' },
        { id: 3, title: '대체당 말차 케이크 🍰', url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80' },
        { id: 4, title: '글루텐프리 아보카도 샌드위치 🥪', url: 'https://images.unsplash.com/photo-1540713434306-5850587b6949?w=400&q=80' },
        { id: 5, title: '비건 비빔밥 🥗', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80' },
        { id: 6, title: '넛프리 바나나 브레드 🍌', url: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&q=80' }
    ];

    const handleReviewListClick = () => {
        alert('🔧 [F-REVIEW-002] "작성한 리뷰 리스트" 조회 기능은 현재 개발 진행 중(미구현) 상태입니다.');
    };

    return (
        <div className="min-h-screen w-screen bg-gray-50 flex flex-col items-center justify-center p-6 select-none relative overflow-hidden">
            <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl shadow-xl p-8 space-y-6 relative z-10 animate-in fade-in duration-200">

                <Link
                    href="/"
                    className="absolute top-4 left-4 bg-gray-100 border border-gray-200 text-[10px] font-bold text-gray-500 px-3 py-1.5 rounded-lg hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all shadow-sm active:scale-95 cursor-pointer"
                    title="지도 페이지 홈으로 이동"
                >
                    로고 🌱
                </Link>

                <div className="text-right">
                    <Link
                        href="/mypage/edit"
                        className="text-[10px] font-bold text-green-700 bg-green-50 hover:bg-green-100 px-2.5 py-1.5 rounded-lg transition-all shadow-sm tracking-wider inline-block active:scale-95"
                    >
                        수정하기 ⚙️
                    </Link>
                </div>

                <div className="flex flex-col items-center space-y-3 pt-2">
                    <div className="w-24 h-24 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center text-3xl shadow-inner overflow-hidden">
                        {avatar.startsWith('data:image') || avatar.startsWith('http') ? (
                            <img src={avatar} alt="user-avatar" className="w-full h-full object-cover" />
                        ) : (
                            avatar
                        )}
                    </div>
                    <div className="text-center">
                        <h2 className="text-base font-bold text-gray-900">{nickname}</h2>
                        <p className="text-xs text-gray-500 font-semibold mt-0.5">{email}</p>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">자기소개</label>
                    <div className="w-full h-20 bg-gray-100 border border-gray-200 rounded-xl p-3 text-xs text-gray-600 flex items-start justify-start leading-relaxed shadow-inner overflow-y-auto">
                        {bio}
                    </div>
                </div>

                <div className="space-y-3 pt-2">
                    <button
                        type="button"
                        onClick={() => setIsPhotoModalOpen(true)}
                        className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs transition-colors border border-gray-200 text-center active:scale-[0.98]"
                    >
                        사진첩 열기 📸
                    </button>

                    <button
                        type="button"
                        onClick={handleReviewListClick}
                        className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-400 font-medium rounded-xl text-xs transition-colors border border-gray-200 border-dashed text-center relative"
                    >
                        작성한 리뷰 리스트
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded">미구현</span>
                    </button>
                </div>

                <div className="pt-4 border-t border-gray-100 text-center text-[11px] text-gray-400 font-medium">
                    현재 마이페이지 독립형 스프린트 조립 중입니다.
                </div>
            </div>

            {/* GALLERY MODAL 구역 생략 (기존코드 100% 동일 유지) */}
            {isPhotoModalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="w-full max-w-lg bg-white border border-gray-100 rounded-3xl shadow-2xl p-6 relative flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center pb-3 border-b border-gray-100 flex-shrink-0">
                            <h3 className="text-sm font-bold text-gray-900 tracking-tight flex items-center"><span className="mr-1.5">📸</span> {nickname}님의 비건 안심 갤러리</h3>
                            <button type="button" onClick={() => setIsPhotoModalOpen(false)} className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full font-bold text-xs">✕</button>
                        </div>
                        <div className="flex-1 overflow-y-auto pt-4 pr-1 space-y-2">
                            <p className="text-[10px] text-gray-400 font-medium">총 {mockPhotos.length}개의 안심 먹거리 추억이 보관되어 있습니다.</p>
                            <div className="grid grid-cols-3 gap-3">
                                {mockPhotos.map((photo) => (
                                    <div key={photo.id} className="aspect-square w-full rounded-xl bg-gray-50 border border-gray-200 overflow-hidden relative group cursor-pointer shadow-sm hover:ring-2 hover:ring-green-600/40 transition-all" title={photo.title}>
                                        <img src={photo.url} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                            <span className="text-[9px] font-semibold text-white truncate w-full">{photo.title}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end flex-shrink-0">
                            <button type="button" onClick={() => setIsPhotoModalOpen(false)} className="px-4 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-semibold shadow-sm">닫기</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}