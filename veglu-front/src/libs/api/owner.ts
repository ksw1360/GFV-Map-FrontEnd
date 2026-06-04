// lib/api/owner.ts 파일 내부
import { Store, Review, Menu } from '../../../../../../Users/tjoeun/Documents/카카오톡 받은 파일/veglufront-main/types/owner';

// 서버에서 가게 정보를 가져오는 함수
export async function getStoreDetail(id: string): Promise<Store> {
    // 실제로는 여기서 await fetch('/api/stores/' + id) 등을 사용합니다.
    // 지금은 테스트용 더미 데이터를 리턴합니다.
    return {
        id: id,
        name: "낭만모로코",
        rating: 4.7,
        hours: "10:00 - 22:00",
        breakTime: "15:00 - 17:00",
        phone: "02-123-4567",
        address: "서울특별시 관악구 관악로 1길 98",
    };
}

// 리뷰 목록을 가져오는 함수
export async function getReviews(storeId: string): Promise<Review[]> {
    return [
        {
            id: "1",
            userId: "abcd1234",
            content: "음식이 솔직히 기대 이하...",
            rating: 4,
            date: "2026-06-01",
            hasReply: false,
        }
    ];
}