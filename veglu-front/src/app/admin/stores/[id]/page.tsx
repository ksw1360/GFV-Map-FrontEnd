'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const DUMMY_STORE = {
    id: '1',
    name: '낭만모로코',
    rating: 4.7,
    hours: '10:00 - 22:00',
    breakTime: '브레이크타임 : 15:00 - 17:00',
    phone: '02-123-4567',
    address: '서울특별시 관악구 관악로14길 88',
    thumbnail: 'https://i.pinimg.com/736x/bf/c5/64/bfc56449fe1871d5cf1afacfdac52456.jpg',
    isPendingApproval: true,
    menus: [
        { id: '1', name: '두부아보카도샐러드', description: '부드러운 두부와 크리미한 아보카도를 신선한 채소와 함께 담아낸 샐러드입니다.', thumbnail: 'https://i.pinimg.com/1200x/cb/26/23/cb2623d77ded2ff0650182f1709d788f.jpg' },
        { id: '2', name: '두부아보카도샐러드', description: '부드러운 두부와 크리미한 아보카도를 신선한 채소와 함께 담아낸 샐러드입니다.', thumbnail: 'https://i.pinimg.com/1200x/cb/26/23/cb2623d77ded2ff0650182f1709d788f.jpg' },
        { id: '3', name: '두부아보카도샐러드', description: '부드러운 두부와 크리미한 아보카도를 신선한 채소와 함께 담아낸 샐러드입니다.', thumbnail: 'https://i.pinimg.com/1200x/cb/26/23/cb2623d77ded2ff0650182f1709d788f.jpg' },
        { id: '4', name: '두부아보카도샐러드', description: '부드러운 두부와 크리미한 아보카도를 신선한 채소와 함께 담아낸 샐러드입니다.', thumbnail: 'https://i.pinimg.com/1200x/cb/26/23/cb2623d77ded2ff0650182f1709d788f.jpg' },
        { id: '5', name: '두부아보카도샐러드', description: '부드러운 두부와 크리미한 아보카도를 신선한 채소와 함께 담아낸 샐러드입니다.', thumbnail: 'https://i.pinimg.com/1200x/cb/26/23/cb2623d77ded2ff0650182f1709d788f.jpg' },
        { id: '6', name: '두부아보카도샐러드', description: '부드러운 두부와 크리미한 아보카도를 신선한 채소와 함께 담아낸 샐러드입니다.', thumbnail: 'https://i.pinimg.com/1200x/cb/26/23/cb2623d77ded2ff0650182f1709d788f.jpg' },
        { id: '7', name: '두부아보카도샐러드', description: '부드러운 두부와 크리미한 아보카도를 신선한 채소와 함께 담아낸 샐러드입니다.', thumbnail: 'https://i.pinimg.com/1200x/cb/26/23/cb2623d77ded2ff0650182f1709d788f.jpg' },
        { id: '8', name: '두부아보카도샐러드', description: '부드러운 두부와 크리미한 아보카도를 신선한 채소와 함께 담아낸 샐러드입니다.', thumbnail: 'https://i.pinimg.com/1200x/cb/26/23/cb2623d77ded2ff0650182f1709d788f.jpg' },
        { id: '9', name: '두부아보카도샐러드', description: '부드러운 두부와 크리미한 아보카도를 신선한 채소와 함께 담아낸 샐러드입니다.', thumbnail: 'https://i.pinimg.com/1200x/cb/26/23/cb2623d77ded2ff0650182f1709d788f.jpg' },
        { id: '10', name: '두부아보카도샐러드', description: '부드러운 두부와 크리미한 아보카도를 신선한 채소와 함께 담아낸 샐러드입니다.', thumbnail: 'https://i.pinimg.com/1200x/cb/26/23/cb2623d77ded2ff0650182f1709d788f.jpg' },
    ],
    reviews: [
        { id: '1', author: 'abcd1234', content: '음식이 정말 맛있었어요. 비건 메뉴인데도 맛이 전혀 부족하지 않았고 다시 방문하고 싶은 곳입니다.' },
        { id: '2', author: 'abcd1234', content: '분위기도 좋고 직원분들도 친절했어요. 글루텐프리 옵션이 있어서 좋았습니다.' },
        { id: '3', author: 'user5678', content: '비건 음식인데도 맛이 풍부해서 놀랐어요. 다음에 또 오고 싶습니다.' },
        { id: '4', author: 'user9999', content: '가격 대비 퀄리티가 훌륭해요. 글루텐프리 메뉴도 다양해서 좋았습니다.' },
        { id: '5', author: 'user0001', content: '직원분들이 친절하고 매장도 깔끔해요.' },
    ],
};

const TABS = ['홈', '메뉴', '리뷰', '사진'];
const DIVIDER = { borderTop: '8px solid #f3f4f6' };

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex gap-2 text-xs text-gray-600">
            {label && <span className="text-gray-400 w-6 flex-shrink-0">{label}</span>}
            <span>{value}</span>
        </div>
    );
}

function StarIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#f5a623" stroke="none">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
    );
}

function UserIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
    );
}

function EllipsisIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
        </svg>
    );
}

export default function StoreDetailPage({ params }: { params: { id: string } }) {
    const [activeTab, setActiveTab] = useState('홈');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const tabBarRef = useRef<HTMLDivElement>(null);

    function getTabBarBottom(): number {
        if (!tabBarRef.current) return 100;
        return tabBarRef.current.getBoundingClientRect().bottom + window.scrollY;
    }

    useEffect(() => {
        function onScroll() {
            const offset =
                (tabBarRef.current?.offsetHeight ?? 0) + 20;

            const scrollPos = window.scrollY + offset;

            let currentTab = TABS[0];

            TABS.forEach((tab) => {
                const el = sectionRefs.current[tab];
                if (!el) return;

                if (scrollPos >= el.offsetTop) {
                    currentTab = tab;
                }
            });

            setActiveTab(currentTab);
        }

        window.addEventListener('scroll', onScroll, {
            passive: true,
        });

        onScroll();

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    function scrollToSection(tab: string) {
        const el = sectionRefs.current[tab];
        if (!el) return;

        const headerHeight =
            tabBarRef.current?.offsetHeight ?? 0;

        window.scrollTo({
            top: el.offsetTop - headerHeight,
            behavior: 'smooth',
        });
    }

    return (
        <div className="max-w-lg mx-auto">
            {/* 탭 바 */}
            <div ref={tabBarRef} className="sticky top-0 z-10 bg-white border-b border-gray-200">
                <nav className="flex justify-center">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => scrollToSection(tab)}
                            className={`px-6 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                                activeTab === tab
                                    ? 'border-gray-800 text-gray-900'
                                    : 'border-transparent text-gray-400 hover:text-gray-700'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {/* 홈 섹션 */}
            <div ref={(el) => { sectionRefs.current['홈'] = el; }} className="px-5 py-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">홈</h2>
                <div className="flex gap-4">
                    <div style={{ width: '80px', height: '80px' }} className="rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                        <img src={DUMMY_STORE.thumbnail} alt={DUMMY_STORE.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h1 className="text-lg font-semibold text-gray-900">{DUMMY_STORE.name}</h1>
                                    <span className="flex items-center gap-1 text-sm text-gray-500"><StarIcon /> {DUMMY_STORE.rating}</span>
                                </div>
                                <InfoRow label="영업" value={DUMMY_STORE.hours} />
                                <InfoRow label="" value={DUMMY_STORE.breakTime} />
                                <InfoRow label="전화" value={DUMMY_STORE.phone} />
                                <p className="text-xs text-gray-500 leading-relaxed mt-1">{DUMMY_STORE.address}</p>
                            </div>
                            {DUMMY_STORE.isPendingApproval && (
                                <div className="relative">
                                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-1 text-gray-400 hover:text-gray-600 rounded-full transition-colors">
                                        <EllipsisIcon />
                                    </button>
                                    {isMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-28 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                                            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">수정요구</button>
                                            <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">삭제</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 메뉴 섹션 */}
            <div ref={(el) => { sectionRefs.current['메뉴'] = el; }} style={DIVIDER} className="px-5 py-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">메뉴</h2>
                <div className="flex flex-col gap-4">
                    {DUMMY_STORE.menus.map((menu) => (
                        <div key={menu.id} className="flex gap-3 items-start">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                                <img src={menu.thumbnail} alt={menu.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{menu.name}</p>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{menu.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 리뷰 섹션 */}
            <div ref={(el) => { sectionRefs.current['리뷰'] = el; }} style={DIVIDER} className="px-5 py-5 min-h-[600px]">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">리뷰</h2>
                <ul className="flex flex-col divide-y divide-gray-100">
                    {DUMMY_STORE.reviews.slice(0, 4).map((review) => (
                        <li key={review.id} className="py-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
                                    <UserIcon />
                                </div>
                                <span className="text-sm font-medium text-gray-800">{review.author}</span>
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">{review.content}</p>
                        </li>
                    ))}
                </ul>
                <Link href={`/admin/stores/${DUMMY_STORE.id}/reviews`}>
                    <button className="w-full mt-4 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        리뷰 더보기
                    </button>
                </Link>
            </div>

            {/* 사진 섹션 */}
            <div ref={(el) => { sectionRefs.current['사진'] = el; }} style={DIVIDER} className="px-5 py-5 min-h-[600px]">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">사진</h2>
                <p className="text-xs text-gray-400 min-h-screen">등록된 사진이 없습니다.</p>
            </div>
        </div>
    );
}