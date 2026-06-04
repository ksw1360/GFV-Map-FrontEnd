import Link from 'next/link';
import { StoreCard } from '@/components/owner/StoreCard';

const stores = [
    { id: '1', name: '낭만모로코', thumbnail: 'https://i.pinimg.com/736x/bf/c5/64/bfc56449fe1871d5cf1afacfdac52456.jpg' },
    { id: '2', name: '낭만모로코', thumbnail: 'https://i.pinimg.com/736x/bf/c5/64/bfc56449fe1871d5cf1afacfdac52456.jpg' },
    { id: '3', name: '낭만모로코', thumbnail: 'https://i.pinimg.com/736x/bf/c5/64/bfc56449fe1871d5cf1afacfdac52456.jpg' },
];

export default function DashboardPage() {
    return (
        <div className="max-w-lg mx-auto px-5 py-6">
            <h1 className="text-xl font-bold mb-6 text-gray-900">내 가게 목록</h1>
            <ul className="flex flex-col gap-4">
                {stores.map((store) => (
                    <li key={store.id}>
                        <Link href={`/owner/store/${store.id}`}>
                            <StoreCard store={store} />
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}