import { apiClient } from './client';
import { serverApiClient } from './serverClient';

// 타입 정의
export type ReviewResponse = {
    reviewId: number;
    restaurantId: number;
    restaurantName: string;
    userId: number;
    userNickname: string;
    userProfileImageUrl?: string;
    rating: number;
    content: string;
    photos?: string[];
    visitDate?: string;
    companionCount?: number;
    recommendedMenu?: string;
    createdAt: string;
    updatedAt: string;
};

export type ReviewReplyResponse = {
    replyId: number;
    reviewId: number;
    ownerId: number;
    ownerNickname: string;
    content: string;
    createdAt: string;
    updatedAt: string;
};

// 식당 리뷰 목록 조회
export async function getReviewsByRestaurant(
    restaurantId: number,
    page = 0,
    size = 10
) {
    return apiClient(`/review/restaurant/${restaurantId}?page=${page}&size=${size}`);
}

// 리뷰 작성
export async function createReview(data: {
    restaurantId: number;
    rating: number;
    content: string;
    photos?: string[];
    visitDate?: string;
    companionCount?: number;
    recommendedMenu?: string;
}): Promise<ReviewResponse> {
    return apiClient('/review', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

// 리뷰 수정
export async function updateReview(
    reviewId: number,
    data: {
        rating?: number;
        content?: string;
        photos?: string[];
        visitDate?: string;
        companionCount?: number;
        recommendedMenu?: string;
    }
): Promise<ReviewResponse> {
    return apiClient(`/review/${reviewId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

// 리뷰 삭제
export async function deleteReview(reviewId: number): Promise<string> {
    return apiClient(`/review/${reviewId}`, { method: 'DELETE' });
}

// 내 리뷰 목록
export async function getMyReviews(
    page = 0,
    size = 10
): Promise<{ content: ReviewResponse[]; totalPages: number; totalElements: number }> {
    return apiClient(`/review/my?page=${page}&size=${size}`);
}

// 답글 조회
export async function getReplyByReview(reviewId: number): Promise<ReviewReplyResponse> {
    return apiClient(`/review-reply/review/${reviewId}`);
}

// 답글 작성
export async function createReply(data: {
    reviewId: number;
    content: string;
}): Promise<ReviewReplyResponse> {
    return apiClient('/review-reply', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

// 답글 수정
export async function updateReply(
    replyId: number,
    content: string
): Promise<ReviewReplyResponse> {
    return apiClient(`/review-reply/${replyId}`, {
        method: 'PUT',
        body: JSON.stringify({ content }),
    });
}

// 답글 삭제
export async function deleteReply(replyId: number): Promise<string> {
    return apiClient(`/review-reply/${replyId}`, { method: 'DELETE' });
}