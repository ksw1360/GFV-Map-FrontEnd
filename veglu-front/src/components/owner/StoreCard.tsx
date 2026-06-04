"use client";

interface StoreCardProps {
    store: {
        id: string;
        name: string;
        thumbnail: string
    };
}

export function StoreCard({ store }: StoreCardProps) {
    return (
        <div
            className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all"
            style={{ minHeight: '72px' }}
        >
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                <img
                    src={store.thumbnail}
                    alt={store.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                    }}
                />
            </div>
            <span className="text-base font-semibold text-gray-800">{store.name}</span>
        </div>
    );
}