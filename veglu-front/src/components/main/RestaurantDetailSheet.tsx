'use client';

import React, { useState, useEffect, useRef } from 'react';
import { toggleFavorite, checkFavorite } from '@/libs/api/favorite';
import { createPhoto } from '@/libs/api/photo';

interface Restaurant {
    restaurant_id: number;
    name: string;
    address: string;
    points: string;
    matchedMenus: string[];
    veganType: string;
}

interface MenuSpec {
    menuId: number;
    name: string;
    price?: number;
    description: string;
    category?: 'MAIN' | 'SIDE' | 'DRINK' | 'DESSERT';
    veganType?: 'VEGAN' | 'LACTO' | 'OVO' | 'LACTO_OVO' | 'PESCO';
    allergens?: string[];
    imageUrl: string;
    isSignature: boolean;
    isAvailable: boolean;
    isSeasonal: boolean;
}

interface ReviewItem {
    reviewId?: number;
    restaurantId: number;
    rating: number;
    content: string;
    photos?: string[];
    visitDate?: string;
    companionCount?: number;
    recommendedMenu?: string;
    userNickname?: string;
    userProfileImageUrl?: string;
    createdAt?: string;
    updatedAt?: string;
    userId?: number;
}

interface RestaurantDetailSheetProps {
    restaurant: Restaurant | null;
    onClose: () => void;
    isSidebarOpen: boolean;
}

type TabType = 'HOME' | 'MENU' | 'REVIEW' | 'PHOTO';

export default function RestaurantDetailSheet({ restaurant, onClose, isSidebarOpen }: RestaurantDetailSheetProps) {

    const [activeTab, setActiveTab] = useState<TabType>('HOME');
    const [shouldRender, setShouldRender] = useState(false);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);

    const [stableRestaurantId, setStableRestaurantId] = useState<number>(0);
    const cachedRestaurantRef = useRef<Restaurant | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isFavorited, setIsFavorited] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const [menus, setMenus] = useState<MenuSpec[]>([]);
    const [isMenuLoading, setIsMenuLoading] = useState(false);

    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [isReviewLoading, setIsReviewLoading] = useState(false);

    const [writeRating, setWriteRating] = useState<number>(5.0);
    const [writeContent, setWriteContent] = useState<string>('');
    const [writeCompanionCount, setWriteCompanionCount] = useState<number>(1);
    const [writeRecMenu, setWriteRecMenu] = useState<string>('');
    const [writePhotoUrl, setWritePhotoUrl] = useState<string>('');
    const [uploadedFileName, setUploadedFileName] = useState<string>(''); // 🎯 순수 사진 파일명 추적 상태망 유지
    const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

    const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://192.168.7.120:5000';

    useEffect(() => {
        if (restaurant) {
            cachedRestaurantRef.current = restaurant;

            const rawId = restaurant.restaurant_id;
            const parsed = Number(rawId);

            if (!isNaN(rawId) && rawId > 0) {
                setStableRestaurantId(rawId);
                console.log("🎯 [잠금 성공] 백엔드 명세와 동기화 완료 ID ➔", parsed);

                fetchRestaurantMenus(rawId);
                fetchRestaurantReviews(rawId);
            }

            setShouldRender(true);
            setIsAnimatingOut(false);
            setActiveTab('HOME');
            resetReviewForm();
        } else if (shouldRender) {
            setIsAnimatingOut(true);
            const timer = setTimeout(() => {
                setShouldRender(false);
                setIsAnimatingOut(false);
                cachedRestaurantRef.current = null;
                setStableRestaurantId(0);
                setIsFavorited(false);
                setToastMessage(null);
                setMenus([]);
                setReviews([]);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [restaurant]);

    // 즐겨찾기 여부 확인
    useEffect(() => {
        if (!stableRestaurantId || stableRestaurantId <= 0) return;
        checkFavorite(stableRestaurantId)
            .then((res: { isFavorite: boolean }) => setIsFavorited(res.isFavorite))
            .catch(() => {});
    }, [stableRestaurantId]);

    // 토스트 자동 소멸
    useEffect(() => {
        if (!toastMessage) return;
        const timer = setTimeout(() => setToastMessage(null), 2500);
        return () => clearTimeout(timer);
    }, [toastMessage]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || stableRestaurantId === 0) return;

        // 🎯 [순수 요구명세 수립] 사용자가 고른 실물 이미지의 파일명을 상단 상태칸에 고착
        setUploadedFileName(file.name);

        try {
            const accessToken = localStorage.getItem('accessToken');
            const fd = new FormData();
            fd.append('file', file);

            // 1단계: S3 바이너리 파일 전송망 노크
            const upRes = await fetch(`${BACKEND_URL}/photo/upload`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${accessToken}` },
                body: fd,
            });

            if (!upRes.ok) throw new Error("S3 업로드 실패");
            const { url } = await upRes.json();

            setWritePhotoUrl(url);

            // 2단계: 🎯 [photo.ts 내부 구조 결속] 하드코딩 fetch 구역을 원천 추상화 함수인 createPhoto로 정밀 이식 교체 완료
            await createPhoto({
                url: url,
                type: 'RESTAURANT',
                restaurantId: stableRestaurantId,
                menuId: undefined,
                caption: "식당 사진",
                isMain: false
            });

            setToastMessage("📸 사진이 안전하게 등록되었습니다!");
            fetchRestaurantReviews(stableRestaurantId);

        } catch (err) {
            console.error("사진 업로드 프로세스 에러:", err);
            alert("사진 업로드 중 문제가 발생했습니다.");
        }
    };

    const resetReviewForm = () => {
        setWriteRating(5.0);
        setWriteContent('');
        setWriteCompanionCount(1);
        setWriteRecMenu('');
        setWritePhotoUrl('');
        setUploadedFileName(''); // 🎯 초기화 무대 연동 유지
    };

    const fetchRestaurantMenus = async (id: number) => {
        setIsMenuLoading(true);
        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await fetch(`${BACKEND_URL}/restaurant/${id}/menus`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': accessToken ? `Bearer ${accessToken}` : ''
                }
            });
            if (response.ok) {
                const data = await response.json();
                setMenus(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error("메뉴판 수입 실패:", err);
        } finally {
            setIsMenuLoading(false);
        }
    };

    const fetchRestaurantReviews = async (restaurantId: number) => {
        setIsReviewLoading(true);
        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await fetch(`${BACKEND_URL}/review/restaurant/${restaurantId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': accessToken ? `Bearer ${accessToken}` : ''
                }
            });
            if (response.ok) {
                const data = await response.json();
                if (data && data.content && Array.isArray(data.content)) {
                    setReviews(data.content);
                } else if (Array.isArray(data)) {
                    setReviews(data);
                } else {
                    setReviews([]);
                }
            }
        } catch (err) {
            console.error("리뷰 피드 조회 실패:", err);
        } finally {
            setIsReviewLoading(false);
        }
    };

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stableRestaurantId || stableRestaurantId <= 0) {
            alert('식당 일련 번호가 유실되었습니다. 마커를 다시 클릭해 주세요.');
            return;
        }
        if (!writeContent.trim()) {
            alert('안심 리뷰 내용을 작성해 주세요! 🥑');
            return;
        }

        setIsSubmittingReview(true);
        try {
            const accessToken = localStorage.getItem('accessToken');
            const todayStr = new Date().toISOString().split('T')[0];

            const reviewBody = {
                restaurantId: stableRestaurantId,
                rating: writeRating,
                content: writeContent,
                photos: writePhotoUrl.trim() ? [writePhotoUrl.trim()] : [],
                visitDate: todayStr,
                companionCount: Number(writeCompanionCount),
                recommendedMenu: writeRecMenu.trim() || null
            };

            const response = await fetch(`${BACKEND_URL}/review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': accessToken ? `Bearer ${accessToken}` : ''
                },
                body: JSON.stringify(reviewBody)
            });

            if (response.ok) {
                setToastMessage("🎉 안심 비건 리뷰가 등록되었습니다!");
                resetReviewForm();
                fetchRestaurantReviews(stableRestaurantId);
            } else {
                alert('리뷰 등록 실패 (백엔드 세션 만료 혹은 형식 오류)');
            }
        } catch (err) {
            console.error("리뷰 등록 통신 에러:", err);
        } finally {
            setIsSubmittingReview(false);
        }
    };

    // 낙관적 업데이트 기반 즐겨찾기 제어 허브
    const handleFavoriteToggle = async () => {
        const nextFavoriteStatus = !isFavorited;

        try {
            const res = await toggleFavorite(stableRestaurantId);
            const nextFavoriteStatus = typeof res === 'object' && res !== null
                ? (res.isFavorite ?? res.added ?? res.favorited ?? !!res)
                : !!res;

            setIsFavorited(nextFavoriteStatus);
            if (nextFavoriteStatus) {
                setToastMessage("💛 안심 식당으로 찜 완료!");
            } else {
                setToastMessage("☆ 안심 식당 등록이 취소되었습니다.");
            }

            // 🎯 [favorite.ts 연동 완료]
            await toggleFavorite(stableRestaurantId);

        } catch (err) {
            console.error("즐겨찾기 토글 처리 오류:", err);
            setIsFavorited(!nextFavoriteStatus);
            setToastMessage(null);
            alert('즐겨찾기 처리에 실패했습니다.');
        }
    };

    const handleCloseTrigger = () => {
        setIsAnimatingOut(true);
        setTimeout(() => { onClose(); }, 300);
    };

    const currentViewShop = restaurant || cachedRestaurantRef.current;

    if (!shouldRender || !currentViewShop) return null;

    const allGalleryPhotos = reviews
        .flatMap((rev) => rev.photos || [])
        .filter((url) => url && url.trim() !== '');

    return (
        <div
            className={`fixed bottom-0 right-0 bg-white border-t border-gray-200 rounded-t-3xl shadow-[0_-15px_35px_rgba(0,0,0,0.1)] z-20 p-6 flex flex-col transition-all duration-300 ease-out h-[480px] ${
                isSidebarOpen ? 'left-[360px]' : 'left-0'
            } ${
                isAnimatingOut ? 'transform translate-y-full opacity-0' : 'transform translate-y-0 opacity-100'
            }`}
        >
            <div className="flex items-start justify-between border-b border-gray-100 pb-3 flex-shrink-0 relative">
                <div className="flex items-center space-x-4 overflow-hidden">
                    <div className="w-14 h-14 bg-green-50 border border-green-100 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl shadow-inner">🌱</div>
                    <div className="space-y-1 overflow-hidden">
                        <div className="flex items-center space-x-2.5">
                            <h2 className="text-lg font-black text-gray-900 truncate max-w-[280px] md:max-w-[500px]">
                                {currentViewShop.name}
                            </h2>
                            <span className="text-[10px] bg-green-700 text-white font-black px-2 py-0.5 rounded-md uppercase tracking-wider flex-shrink-0">
                                {currentViewShop.veganType}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 font-semibold truncate">📍 {currentViewShop.address}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 relative">
                    {toastMessage && (
                        <div className="absolute bottom-14 right-0 bg-black text-white font-black text-[11px] px-4 py-2 rounded-xl shadow-2xl tracking-wide z-[999] flex items-center gap-1.5 border border-white/20 animate-in fade-in slide-in-from-bottom-2 duration-200">
                            {toastMessage}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handleFavoriteToggle}
                        style={{ color: isFavorited ? '#FBBF24' : '#D1D5DB' }}
                        className={`p-2 rounded-xl transition-all duration-300 border flex items-center justify-center w-9 h-9 text-lg shadow-sm active:scale-95 cursor-pointer ${
                            isFavorited
                                ? 'bg-yellow-50 border-yellow-400 font-black'
                                : 'bg-gray-50 border-gray-200 text-gray-300 hover:bg-gray-100'
                        }`}
                        title={isFavorited ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                    >
                        {isFavorited ? '★' : '☆'}
                    </button>

                    <button
                        type="button"
                        onClick={handleCloseTrigger}
                        className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-xl transition-colors border border-gray-200 flex items-center justify-center w-9 h-9"
                    >
                        ✕
                    </button>
                </div>
            </div>

            <div className="flex space-x-1 border-b border-gray-100 my-3 text-xs font-bold flex-shrink-0">
                {(['HOME', 'MENU', 'REVIEW', 'PHOTO'] as const).map((tab) => {
                    const tabNames = {
                        HOME: '홈 (기본)',
                        MENU: `메뉴 (${menus.length})`,
                        REVIEW: `리뷰 (${reviews.length})`,
                        PHOTO: `사진 (${allGalleryPhotos.length})`
                    };
                    return (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2.5 transition-all relative top-[1px] ${activeTab === tab ? 'text-green-700 border-b-2 border-green-700 font-extrabold' : 'text-gray-400 hover:text-gray-600 font-medium'}`}
                        >
                            {tabNames[tab]}
                        </button>
                    );
                })}
            </div>
            <div className="flex-1 overflow-y-auto pr-1 text-xs text-gray-600 leading-relaxed min-h-0 bg-gray-50/50 rounded-xl p-4 border border-gray-100">

                {activeTab === 'HOME' && (
                    <div className="space-y-3 animate-in fade-in duration-200">
                        <p className="font-semibold text-gray-800 text-sm">💡 매장 안내 요약</p>
                        <div className="bg-white p-3.5 border border-gray-200 rounded-xl space-y-2 shadow-sm">
                            <p>✔️ 저희 매장은 동물성 원료를 일체 배제한 안심 비건 가공 공정을 거칩니다.</p>
                            {currentViewShop.matchedMenus && currentViewShop.matchedMenus.length > 0 && (
                                <p>🔍 검색어 매칭 키워드: <span className="text-green-700 font-bold bg-green-50 px-1.5 py-0.5 rounded-md">{currentViewShop.matchedMenus.join(', ')}</span></p>
                            )}
                            <p>⏰ 영업 시간: 매일 10:00 ~ 21:00 (라스트오더 20:30)</p>
                        </div>
                    </div>
                )}

                {activeTab === 'MENU' && (
                    <div className="space-y-2 animate-in fade-in duration-200">
                        <p className="font-semibold text-gray-800 text-sm">📋 실물 메뉴판 명세 (서버 실시간 연동)</p>
                        {isMenuLoading && <div className="text-center py-10 font-medium text-gray-400 animate-pulse">식당 메뉴판 데이터 긁어오는 중...</div>}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {menus.map((item) => (
                                <div key={item.menuId} className="bg-white p-4 border border-gray-200 rounded-2xl flex space-x-3 shadow-sm hover:border-green-500 transition-all relative overflow-hidden">
                                    {item.isSignature && <div className="absolute top-0 left-0 bg-amber-500 text-white text-[8px] font-black px-2 py-0.5 rounded-br-lg uppercase tracking-tighter">RECOMMEND</div>}
                                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex-shrink-0 border overflow-hidden flex items-center justify-center text-xs text-gray-400">
                                        {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /> : '🌱'}
                                    </div>
                                    <div className="space-y-1 w-full overflow-hidden">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-gray-900 text-xs truncate max-w-[140px]">{item.name || '이름 없음'}</h4>
                                            <span className="text-[10px] font-black text-green-700">
                                                {typeof item.price === 'number' ? `${item.price.toLocaleString()}원` : '가격 준비중'}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-gray-400 truncate leading-tight">{item.description || '상세 설명 명세가 준비되어 있지 않습니다.'}</p>
                                        <div className="flex flex-wrap gap-1 pt-0.5">
                                            {item.veganType && (
                                                <span className="text-[8px] bg-green-50 text-green-700 border border-green-200/50 font-extrabold px-1 rounded-sm">{item.veganType}</span>
                                            )}
                                            {item.allergens && item.allergens.length > 0 && item.allergens.map(al => (
                                                <span key={al} className="text-[8px] bg-red-50 text-red-600 border border-red-100 font-medium px-1 rounded-sm">🚫 {al}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {!isMenuLoading && menus.length === 0 && <div className="col-span-2 text-center py-10 text-xs text-gray-400 font-medium">등록된 메뉴판 명세 데이터가 부재합니다.</div>}
                        </div>
                    </div>
                )}

                {activeTab === 'REVIEW' && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3 text-left">
                            <p className="font-black text-gray-800 text-xs flex items-center">📝 이 식당에 비건 안심 리뷰 남기기</p>

                            <div className="grid grid-cols-2 gap-3 text-[11px]">
                                <div className="space-y-1">
                                    <label className="font-bold text-gray-500 block">⭐ 안심 평점 선택</label>
                                    <select
                                        value={writeRating.toString()}
                                        onChange={(e) => setWriteRating(Number(e.target.value))}
                                        className="w-full border p-1.5 rounded-lg bg-gray-50 text-xs font-bold focus:outline-none cursor-pointer border-gray-300 text-gray-800"
                                    >
                                        <option value="5">⭐⭐⭐⭐⭐ (5.0)</option>
                                        <option value="4">⭐⭐⭐⭐ (4.0)</option>
                                        <option value="3">⭐⭐⭐ (3.0)</option>
                                        <option value="2">⭐⭐ (2.0)</option>
                                        <option value="1">⭐ (1.0)</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="font-bold text-gray-500 block">👥 방문 인원 (인)</label>
                                    <input type="number" min={1} max={20} value={writeCompanionCount} onChange={(e) => setWriteCompanionCount(Number(e.target.value))} className="w-full border p-1.5 rounded-lg bg-gray-50 text-xs font-bold focus:outline-none" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="font-bold text-[11px] text-gray-500 block">📸 사진 첨부 (파일)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="우측 버튼으로 사진 업로드"
                                        value={uploadedFileName}
                                        className="flex-1 border p-1.5 rounded-lg bg-gray-50 text-xs font-medium focus:outline-none"
                                        disabled={true}
                                    />
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-[10px] rounded-lg transition-all">
                                        파일 선택
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1 text-[11px]">
                                <label className="font-bold text-gray-500 block">👍 추천 메뉴 입력 (선택)</label>
                                <input type="text" placeholder="예: 비건 토마토 파스타" value={writeRecMenu} onChange={(e) => setWriteRecMenu(e.target.value)} className="w-full border p-1.5 rounded-lg bg-gray-50 text-xs font-medium focus:outline-none" />
                            </div>

                            <div className="space-y-1">
                                <label className="font-bold text-[11px] text-gray-500 block">본문 내용 (필수)</label>
                                <textarea rows={2} placeholder="속이 편하고 맛있는 식당이었나요? 다른 채식인들을 위해 솔직한 안심 평가를 나누어주세요!" value={writeContent} onChange={(e) => setWriteContent(e.target.value)} className="w-full border p-2.5 rounded-xl bg-gray-50 text-xs font-medium focus:outline-none leading-relaxed resize-none" />
                            </div>

                            <div className="text-right">
                                <button type="button" onClick={handleReviewSubmit} disabled={isSubmittingReview} className="px-5 py-2 bg-green-700 hover:bg-green-800 text-white font-black text-[11px] rounded-xl transition-all shadow-sm active:scale-95 disabled:bg-gray-300">
                                    {isSubmittingReview ? '서버로 전송 중...' : '리뷰 등록하기 🚀'}
                                </button>
                            </div>
                        </div>
                        <hr className="border-gray-200/60 my-2" />
                        <p className="font-bold text-gray-800 text-sm text-left">💬 방문자 안심 평판 피드 ({reviews.length})</p>
                        {isReviewLoading && <div className="text-center py-6 font-medium text-gray-400">실시간 리뷰 피드 로딩 중...</div>}

                        <div className="space-y-2.5">
                            {reviews.map((rev, idx) => (
                                <div key={rev.reviewId || `${rev.restaurantId || stableRestaurantId}-${idx}`} className="bg-white border border-gray-200 rounded-2xl p-4 text-left space-y-1.5 shadow-sm">
                                    <div className="flex justify-between items-center text-xs">
                                        <div className="flex items-center space-x-2">
                                            {rev.userProfileImageUrl && (
                                                <img src={rev.userProfileImageUrl} alt="avatar" className="w-4 h-4 rounded-full object-cover border" />
                                            )}
                                            <span className="font-bold text-gray-800">{rev.userNickname || '안심인증회원'}</span>
                                        </div>
                                        <span className="text-[10px] text-gray-400 font-semibold">
                                            {rev.visitDate || (rev.createdAt ? rev.createdAt.split('T')[0] : '최근 방문')}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-xs">
                                        <span className="text-amber-500 font-black">
                                            {'⭐️'.repeat(Math.max(1, Math.min(5, Math.floor(rev.rating || 5))))}
                                        </span>
                                        <span className="text-gray-400 font-bold text-[10px]">({(rev.rating || 5.0).toFixed(1)})</span>
                                        {rev.companionCount && <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-bold">👥 {rev.companionCount}인 방문</span>}
                                    </div>
                                    <p className="text-xs text-gray-600 font-medium whitespace-pre-line leading-relaxed break-all">{rev.content}</p>
                                    {rev.recommendedMenu && (
                                        <div className="text-[10px] bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded-md inline-block">👍 추천메뉴: {rev.recommendedMenu}</div>
                                    )}
                                    {rev.photos && rev.photos.length > 0 && (
                                        <div className="flex space-x-1.5 pt-1 overflow-x-auto">
                                            {rev.photos.map((pUrl, pIdx) => (
                                                <img key={pIdx} src={pUrl} alt="review-attach" className="w-14 h-14 rounded-lg object-cover border border-gray-200 bg-gray-50 flex-shrink-0" />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {!isReviewLoading && reviews.length === 0 && (
                                <div className="text-center py-12 text-xs text-gray-400 font-medium bg-white border rounded-2xl border-dashed">아직 등록된 방문자 안심 평판 피드가 없습니다. <br/>첫 번째 든든한 등불이 되어보세요! ◀</div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'PHOTO' && (
                    <div className="space-y-2 animate-in fade-in duration-200 text-left">
                        <p className="font-bold text-gray-800 text-sm">📸 매장 실물 포토 피드 ({allGalleryPhotos.length})</p>
                        {isReviewLoading && <div className="text-center py-10 text-gray-400 font-medium">갤러리 스캔 중...</div>}
                        <div className="grid grid-cols-3 gap-2.5 pt-1">
                            {allGalleryPhotos.map((url, index) => (
                                <div key={index} className="aspect-square bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm relative group cursor-pointer hover:ring-2 hover:ring-green-600/40 transition-all">
                                    <img src={url} alt="gallery-feed" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                </div>
                            ))}
                        </div>
                        {!isReviewLoading && allGalleryPhotos.length === 0 && (
                            <div className="text-center py-16 text-xs text-gray-400 font-medium bg-white border border-dashed rounded-2xl w-full">매장 전경이나 음식 실물 사진 스펙이 아직 비어있습니다.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
