'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
    onLogout: () => void;
    onFilterChange?: (filters: { searchCategory: string; keyword: string; selectedTags: string[] }) => void;
}

export default function Header({ onLogout, onFilterChange }: HeaderProps) {
    const router = useRouter();

    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    const [searchCategory, setSearchCategory] = useState('region');
    const [keyword, setKeyword] = useState('');
    const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [nickname, setNickname] = useState('위치삼');
    const [profileImageUrl, setProfileImageUrl] = useState('default');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const savedNickname = localStorage.getItem('user_nickname');
        const savedAvatar = localStorage.getItem('user_avatar');

        if (savedNickname) setNickname(savedNickname);
        if (savedAvatar) setProfileImageUrl(savedAvatar);

        setIsMounted(true);
    }, []);

    // 💡 [개정] 타이핑할 때가 아니라 엔터나 버튼을 눌러 "확정"되었을 때만 부모를 깨우는 단일 컨트롤러
    const submitSearch = (currentFilters = selectedFilters) => {
        if (onFilterChange) {
            onFilterChange({
                searchCategory: searchCategory,
                keyword: keyword.trim(),
                selectedTags: currentFilters
            });
        }
    };

    // 엔터키 입력 감지기
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setIsFilterDropdownOpen(false); // 검색 실행 시 필터창은 우아하게 닫아줍니다.
            submitSearch();
        }
    };

    const handleFilterToggle = (filterName: string) => {
        let nextFilters = [];
        if (selectedFilters.includes(filterName)) {
            nextFilters = selectedFilters.filter(item => item !== filterName);
        } else {
            nextFilters = [...selectedFilters, filterName];
        }
        setSelectedFilters(nextFilters);
        // 상세 배너 필터는 누르는 즉시 직관적으로 검색이 트리거되도록 처리
        submitSearch(nextFilters);
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
        return <header className="h-16 border-b border-gray-200 bg-white" />;
    }

    return (
        <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 z-30 shadow-sm relative">
            <div className="text-xl font-extrabold text-green-700 tracking-tight cursor-pointer flex-shrink-0" onClick={() => window.location.href = '/'}>
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

                    {/* 💡 [교정 구역] onChange 시 무분별한 부모 호출을 제거하고, 엔터 전용 KeyDown 바인딩 */}
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFilterDropdownOpen(true)}
                        placeholder="검색어를 입력하고 엔터를 누르세요"
                        className="w-full px-4 h-10 text-sm focus:outline-none text-gray-800"
                    />

                    {/* 💡 [교정 구역] 돋보기 버튼 클릭 시 정식으로 검색 집행 */}
                    <button
                        type="button"
                        onClick={() => { setIsFilterDropdownOpen(false); submitSearch(); }}
                        className="p-2.5 text-gray-400 hover:text-green-600 mr-1 active:scale-95 transition-transform"
                    >
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

            <div className="flex items-center space-x-3 flex-shrink-0">
                <button
                    type="button"
                    onClick={() => router.push('/mypage')}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 border border-gray-200 hover:border-green-600/30 rounded-xl transition-all shadow-sm active:scale-[0.98] group"
                    title="마이페이지로 이동"
                >
                    <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center border border-gray-200 text-base overflow-hidden shadow-inner flex-shrink-0">
                        {profileImageUrl === 'default' || !profileImageUrl || profileImageUrl === 'null' ? (
                            '🥑'
                        ) : (
                            <img src={profileImageUrl} alt="user-avatar" className="w-full h-full object-cover" />
                        )}
                    </div>
                    <span className="text-xs font-bold text-gray-700 group-hover:text-green-700 transition-colors">
                        {nickname}님 ⚙️
                    </span>
                </button>
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