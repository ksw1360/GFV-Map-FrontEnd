type Review = {
    id: string;
    author: string;
    content: string;
    reply?: string;
};

export default function ReviewReplyDrawer({
                                              review,
                                              value,
                                              onChange,
                                              onSubmit,
                                              onClose,
                                          }: {
    review: Review;
    value: string;
    onChange: (v: string) => void;
    onSubmit: () => void;
    onClose: () => void;
}) {
    const MAX = 500;

    return (
        <div className="absolute inset-0 z-20 bg-white flex flex-col">
            <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
                        <UserIcon />
                    </div>
                    <span className="text-sm font-medium text-gray-800">{review.author}</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{review.content}</p>
            </div>
            <div className="flex-1 px-5 py-4 flex flex-col">
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            maxLength={MAX}
            placeholder="내용을 입력하세요."
            className="flex-1 w-full text-sm text-gray-700 resize-none outline-none border border-gray-200 rounded-xl p-3 placeholder:text-gray-300"
            rows={6}
        />
                <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-400">{value.length}/{MAX}</span>
                    <button
                        onClick={onSubmit}
                        disabled={!value.trim()}
                        className="px-5 py-2 text-sm font-medium text-white bg-green-700 rounded-lg disabled:opacity-40 hover:bg-green-800 transition-colors"
                    >
                        작성완료
                    </button>
                </div>
            </div>
        </div>
    );
}

function UserIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
    );
}