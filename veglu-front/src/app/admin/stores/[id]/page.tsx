'use client';

import {use, useEffect, useRef, useState} from 'react';
import Link from 'next/link';
import { getRestaurant, getMenus } from '@/libs/api/restaurant';
import { getReviewsByRestaurant } from '@/libs/api/review';

type Params = Promise<{ id: string }>;

type Store = {
    id: string;
    name: string;
    rating: number;
    hours: string;
    breakTime: string;
    phone: string;
    address: string;
    thumbnail: string;
    isPendingApproval: boolean;
};

type Menu = {
    id: string;
    name: string;
    description: string;
    thumbnail: string;
};

type Review = {
    id: string;
    author: string;
    content: string;
};

type MenuApiResponse = {
    menuId: number;
    name: string;
    description?: string;
    imageUrl?: string;
};

type ReviewApiResponse = {
    reviewId: number;
    userNickname: string;
    content: string;
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

export default function StoreDetailPage({ params }: { params: Params }) {
    const { id } = use(params);

    const [store, setStore] = useState<Store | null>(null);
    const [menus, setMenus] = useState<Menu[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('홈');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const tabBarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function fetchAll() {
            try {
                setLoading(true);

                // 가게 상세
                const storeData = await getRestaurant(Number(id));
                setStore({
                    id: String(storeData.restaurantId ?? storeData.id),
                    name: storeData.name,
                    rating: Number(storeData.rating ?? 0),
                    hours: storeData.hours ?? '',
                    breakTime: storeData.breakTime ?? '',
                    phone: storeData.phone ?? '',
                    address: storeData.address ?? '',
                    thumbnail: storeData.thumbnail ?? storeData.imageUrl ?? '',
                    isPendingApproval: storeData.status === 'PENDING', // ?? false 제거
                });

                // 메뉴 목록
                const menuData = await getMenus(Number(id));
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setMenus(
                    menuData.map((m: MenuApiResponse) => ({
                        id: String(m.menuId),
                        name: m.name,
                        description: m.description ?? '',
                        thumbnail: m.imageUrl ?? '',
                    }))
                );

                // 리뷰 목록
                const reviewData = await getReviewsByRestaurant(Number(id));
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setReviews(
                    reviewData.content.map((r: ReviewApiResponse) => ({
                        id: String(r.reviewId),
                        author: r.userNickname,
                        content: r.content,
                    }))
                );
            } catch (e) {
                console.error('데이터 불러오기 실패', e);
            } finally {
                setLoading(false);
            }
        }
        fetchAll();
    }, [id]);

    useEffect(() => {
        function onScroll() {
            const offset = (tabBarRef.current?.offsetHeight ?? 0) + 20;
            const scrollPos = window.scrollY + offset;
            let currentTab = TABS[0];
            TABS.forEach((tab) => {
                const el = sectionRefs.current[tab];
                if (!el) return;
                if (scrollPos >= el.offsetTop) currentTab = tab;
            });
            setActiveTab(currentTab);
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    function scrollToSection(tab: string) {
        const el = sectionRefs.current[tab];
        if (!el) return;
        const headerHeight = tabBarRef.current?.offsetHeight ?? 0;
        window.scrollTo({ top: el.offsetTop - headerHeight, behavior: 'smooth' });
    }

    if (loading) return (
        <div className="max-w-lg mx-auto flex items-center justify-center py-20">
            <p className="text-sm text-gray-400">로딩 중...</p>
        </div>
    );

    if (!store) return (
        <div className="max-w-lg mx-auto flex items-center justify-center py-20">
            <p className="text-sm text-gray-400">가게 정보를 찾을 수 없습니다.</p>
        </div>
    );

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
                        {store.thumbnail ? (
                            <img src={store.thumbnail} alt={store.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="text-xs text-gray-400">이미지 없음</span>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h1 className="text-lg font-semibold text-gray-900">{store.name}</h1>
                                    <span className="flex items-center gap-1 text-sm text-gray-500">
                    <StarIcon /> {store.rating}
                  </span>
                                </div>
                                {store.hours && <InfoRow label="영업" value={store.hours} />}
                                {store.breakTime && <InfoRow label="" value={store.breakTime} />}
                                {store.phone && <InfoRow label="전화" value={store.phone} />}
                                {store.address && <p className="text-xs text-gray-500 leading-relaxed mt-1">{store.address}</p>}
                            </div>
                            {store.isPendingApproval && (
                                <div className="relative">
                                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-1 text-gray-400 hover:text-gray-600 rounded-full transition-colors">
                                        <EllipsisIcon />
                                    </button>
                                    {isMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-28 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
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
                {menus.length === 0 ? (
                    <p className="text-xs text-gray-400">등록된 메뉴가 없습니다.</p>
                ) : (
                    <div className="flex flex-col gap-4">
                        {menus.map((menu) => (
                            <div key={menu.id} className="flex gap-3 items-start">
                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0 flex items-center justify-center">
                                    {menu.thumbnail ? (
                                        <img src={menu.thumbnail} alt={menu.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-xs text-gray-400">이미지 없음</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{menu.name}</p>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{menu.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 리뷰 섹션 */}
            <div ref={(el) => { sectionRefs.current['리뷰'] = el; }} style={DIVIDER} className="px-5 py-5 min-h-[600px]">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">리뷰</h2>
                {reviews.length === 0 ? (
                    <p className="text-xs text-gray-400">등록된 리뷰가 없습니다.</p>
                ) : (
                    <ul className="flex flex-col divide-y divide-gray-100">
                        {reviews.slice(0, 4).map((review) => (
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
                )}
                <Link href={`/admin/stores/${id}/reviews`}>
                    <button className="w-full mt-4 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        리뷰 더보기
                    </button>
                </Link>
            </div>

            {/* 사진 섹션 */}
            <div ref={(el) => { sectionRefs.current['사진'] = el; }} style={DIVIDER} className="px-5 py-5 min-h-[600px]">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">사진</h2>
                <p className="text-xs text-gray-400">등록된 사진이 없습니다.</p>
            </div>
        </div>
    );
}