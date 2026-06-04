'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
    onLogout: () => void;
}

export default function Header({ onLogout }: HeaderProps) {
    const router = useRouter();

    // 검색창 관련 상호작용 상태 기계
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    const [searchCategory, setSearchCategory] = useState('region');
    const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // ──────────────────────────────────────────────────────────
    // 🥑 백엔드 DTO 필드명 명세(nickname, profileImageUrl) 싱크 조절
    // ──────────────────────────────────────────────────────────
    const [nickname, setNickname] = useState('위치삼');
    const [profileImageUrl, setProfileImageUrl] = useState('default'); // avatar 상태를 DTO 명세로 변경
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const savedNickname = localStorage.getItem('user_nickname');
        const savedAvatar = localStorage.getItem('user_avatar'); // LoginForm이 금고에 넣은 값 꺼내기

        if (savedNickname) setNickname(savedNickname);
        if (savedAvatar) setProfileImageUrl(savedAvatar);

        setIsMounted(true); // ◀ 화면 준비 완료 신호 켜기
    }, []);
    // ──────────────────────────────────────────────────────────

    const handleFilterToggle = (filterName: string) => {
        if (selectedFilters.includes(filterName)) {
            setSelectedFilters(selectedFilters.filter(item => item !== filterName));
        } else {
            setSelectedFilters([...selectedFilters, filterName]);
        }
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsFilterDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!isMounted) {
        // 마운트되기 전(서버 pre-rendering 단계)에는 빈 헤더 틀만 보여주어 꼬임을 원천 차단
        return <header className="h-16 border-b border-gray-200 bg-white" />;
    }

    return (
        <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 z-30 shadow-sm relative">
            <div className="text-xl font-extrabold text-green-700 tracking-tight cursor-pointer flex-shrink-0">
                VEGAN & GF MAP 🌱
            </div>

            {/* 중앙 와이어프레임 4대 카테고리 검색 필터 영역 (F-SEARCH-003) */}
            <div className="flex-1 max-w-3xl mx-6 relative" ref={dropdownRef}>
                <div className="flex items-center border border-gray-300 rounded-xl bg-white shadow-sm focus-within:ring-2 focus-within:ring-green-600/20 focus-within:border-green-600 transition-all overflow-hidden">
                    <select
                        value={searchCategory}
                        onChange={(e) => setSearchCategory(e.target.value)}
                        className="h-10 px-3 bg-gray-50 border-r border-gray-200 text-xs font-semibold text-gray-500 focus:outline-none cursor-pointer"
                    >
                        <option value="region">지역명</option>
                        <option value="store">상호명</option>
                        <option value="menu">메뉴명</option>
                    </select>

                    <input
                        type="text"
                        onFocus={() => setIsFilterDropdownOpen(true)}
                        placeholder="검색어를 입력하세요 (F-SEARCH-003)"
                        className="w-full px-4 h-10 text-sm focus:outline-none text-gray-800"
                    />

                    <button type="button" className="p-2.5 text-gray-400 hover:text-green-600 mr-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                </div>

                {/* 세부 필터 드롭다운 패널 */}
                {isFilterDropdownOpen && (
                    <div className="absolute top-12 left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-xl p-6 z-50 text-xs select-none animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="space-y-4 text-gray-700">
                            <div className="flex items-center min-h-[32px]">
                                <span className="w-24 font-bold text-gray-400 text-left">카테고리</span>
                                <div className="flex space-x-4">
                                    {['다이닝', '베이커리'].map((tag) => (
                                        <button key={tag} type="button" onClick={() => handleFilterToggle(tag)} className={`transition-all font-medium ${selectedFilters.includes(tag) ? 'text-green-600 font-bold underline' : 'text-gray-700 hover:text-black'}`}>{tag}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center min-h-[32px]">
                                <span className="w-24 font-bold text-gray-400 text-left">평균 가격대</span>
                                <div className="flex space-x-5 flex-wrap">
                                    {['10,000원 이하', '10,000원 ~ 20,000원', '20,000원 ~ 30,000원', '30,000원 이상'].map((tag) => (
                                        <button key={tag} type="button" onClick={() => handleFilterToggle(tag)} className={`transition-all font-medium ${selectedFilters.includes(tag) ? 'text-green-600 font-bold underline' : 'text-gray-700 hover:text-black'}`}>{tag}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center min-h-[32px]">
                                <span className="w-24 font-bold text-gray-400 text-left">최소 평점</span>
                                <div className="flex space-x-6">
                                    {['1점', '2점', '3점', '4점', '5점'].map((tag) => (
                                        <button key={tag} type="button" onClick={() => handleFilterToggle(tag)} className={`transition-all font-medium ${selectedFilters.includes(tag) ? 'text-green-600 font-bold underline' : 'text-gray-700 hover:text-black'}`}>{tag}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center min-h-[32px]">
                                <span className="w-24 font-bold text-gray-400 text-left">비건 요소</span>
                                <div className="flex space-x-6">
                                    {['비건', '글루텐프리', '락토', '락토-오보'].map((tag) => (
                                        <button key={tag} type="button" onClick={() => handleFilterToggle(tag)} className={`transition-all font-medium ${selectedFilters.includes(tag) ? 'text-green-600 font-bold underline' : 'text-gray-700 hover:text-black'}`}>{tag}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 우측 상단 유저 정보 및 마이페이지 내비게이션 바 링크 연동 */}
            <div className="flex items-center space-x-3 flex-shrink-0">

                {/* 마이페이지 정보 요약 패널 버튼 */}
                <button
                    type="button"
                    onClick={() => router.push('/mypage')}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 border border-gray-200 hover:border-green-600/30 rounded-xl transition-all shadow-sm active:scale-[0.98] group"
                    title="마이페이지로 이동"
                >
                    {/* ──────────────────────────────────────────────────────────
                       💡 [수정 구역] 백엔드 DTO 명세 양식에 맞춰 이미지 태그 수선
                       'default' 이거나 null/빈 값일 경우 안전하게 아보카도 이모지 출력
                       ────────────────────────────────────────────────────────── */}
                    <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center border border-gray-200 text-base overflow-hidden shadow-inner flex-shrink-0">
                        {profileImageUrl === 'default' || !profileImageUrl || profileImageUrl === 'null' ? (
                            '🥑'
                        ) : (
                            <img
                                src={profileImageUrl}
                                alt="user-avatar"
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                    {/* ────────────────────────────────────────────────────────── */}

                    <span className="text-xs font-bold text-gray-700 group-hover:text-green-700 transition-colors">
                        {nickname}님 ⚙️
                    </span>
                </button>

                {/* 로그아웃 버튼 */}
                <button
                    type="button"
                    onClick={onLogout}
                    className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-semibold transition-colors"
                >
                    로그아웃
                </button>

            </div>
        </header>
    );
}