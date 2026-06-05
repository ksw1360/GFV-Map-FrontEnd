'use client';

type Props = {
    rating: number;
    onChange: (rating: number) => void;
};

export default function StarInput({ rating, onChange }: Props) {
    function handleClick(star: number, isLeft: boolean) {
        const newRating = isLeft ? star - 0.5 : star;
        if (newRating === rating) {
            onChange(Math.max(0, rating - 0.5));
        } else {
            onChange(newRating);
        }
    }

    function getFill(star: number) {
        if (rating >= star) return '#4a7c59';
        if (rating >= star - 0.5) return 'half';
        return 'none';
    }

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
                const fill = getFill(star);
                return (
                    <div key={star} className="relative cursor-pointer" style={{ width: 20, height: 20 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <defs>
                                <linearGradient id={`half-input-${star}`}>
                                    <stop offset="50%" stopColor="#4a7c59" />
                                    <stop offset="50%" stopColor="none" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path
                                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                                fill={fill === 'half' ? `url(#half-input-${star})` : fill}
                                stroke="#4a7c59"
                                strokeWidth="1.5"
                            />
                        </svg>
                        <div className="absolute inset-y-0 left-0 w-1/2" onClick={() => handleClick(star, true)} />
                        <div className="absolute inset-y-0 right-0 w-1/2" onClick={() => handleClick(star, false)} />
                    </div>
                );
            })}
        </div>
    );
}