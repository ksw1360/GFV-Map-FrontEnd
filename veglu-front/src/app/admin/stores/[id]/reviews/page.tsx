type Review = {
    id: string;
    author: string;
    content: string;
};

const DUMMY_REVIEWS: Review[] = [
    {
        id: '1',
        author: 'abcd1234',
        content: '음식은 솔직히 기대 이하였고 전체적으로 관리가 잘 안 되는 느낌이었어요.',
    },
    {
        id: '2',
        author: 'abcd1234',
        content: '매장 위생 상태도 썩 좋아 보이지 않았고 다시 방문하고 싶은 마음은 안 드네요.',
    },
];


export default async function AdminStoreReviewsPage({
                                                        params,
                                                    }: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return (
        <div className="max-w-lg mx-auto px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900 mb-4">리뷰</h2>
            <ul className="flex flex-col divide-y divide-gray-100">
                {DUMMY_REVIEWS.map((review) => (
                    <li key={review.id} className="py-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                <UserIcon />
                            </div>
                            <span className="text-sm font-medium text-gray-800">{review.author}</span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">{review.content}</p>
                    </li>
                ))}
            </ul>
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