import Link from 'next/link';

type Store = {
    id: string;
    name: string;
    thumbnail: string;
    registeredAt: string;
    address: string;
    description: string;
};

export default function StoreListCard({ store }: { store: Store }) {
    return (
        <Link href={`/admin/stores/${store.id}`}>
            <div className="flex gap-4 px-4 py-4 border border-gray-200 rounded-xl bg-white hover:shadow-sm transition-shadow">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                    <img src={store.thumbnail} alt={store.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{store.name}</p>
                    <p className="text-xs text-gray-400">등록: {store.registeredAt}</p>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{store.address}</p>
                    <p className="text-xs text-gray-400 line-clamp-1">{store.description}</p>
                </div>
            </div>
        </Link>
    );
}