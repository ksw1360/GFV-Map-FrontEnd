import { getReviewsByRestaurant } from '@/libs/api/review';

interface Review {
    reviewId: number;
    userProfileImageUrl?: string;
    userNickname: string;
    rating: number;
    content: string;
}

export default async function AdminStoreReviewsPage({
                                                        params,
                                                    }: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    let reviews: Review[] = [];
    try {
        const data = await getReviewsByRestaurant(Number(id));
        reviews = data.content;
    } catch (e) {
        console.error('리뷰 불러오기 실패', e);
    }

    return (
        <div className="max-w-lg mx-auto px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900 mb-4">리뷰</h2>

            {reviews.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">등록된 리뷰가 없습니다.</p>
            ) : (
                <ul className="flex flex-col divide-y divide-gray-100">
                    {reviews.map((review) => (
                        <li key={review.reviewId} className="py-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                    {review.userProfileImageUrl ? (
                                        <img
                                            src={review.userProfileImageUrl}
                                            alt={review.userNickname}
                                            className="w-full h-full object-cover rounded-full"
                                        />
                                    ) : (
                                        <UserIcon />
                                    )}
                                </div>
                                <span className="text-sm font-medium text-gray-800">{review.userNickname}</span>
                                <span className="text-xs text-gray-400">★ {review.rating}</span>
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">{review.content}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function UserIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
        </svg>
    );
}