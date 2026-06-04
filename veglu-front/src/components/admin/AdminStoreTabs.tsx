'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
    { label: '홈',   href: (id: string) => `/admin/stores/${id}` },
    { label: '메뉴', href: (id: string) => `/admin/stores/${id}/menu` },
    { label: '리뷰', href: (id: string) => `/admin/stores/${id}/reviews` },
    { label: '사진', href: (id: string) => `/admin/stores/${id}/photos` },
];

export default function AdminStoreTabs({ storeId }: { storeId: string }) {
    const pathname = usePathname();

    return (
        <nav className="flex justify-center border-b border-gray-200 px-5">
            {TABS.map((tab) => {
                const href = tab.href(storeId);
                const isActive =
                    tab.label === '홈'
                        ? pathname === href
                        : pathname.startsWith(href);

                return (
                    <Link
                        key={href}
                        href={href}
                        className={`
              px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors
              ${isActive
                            ? 'border-gray-800 text-gray-900'
                            : 'border-transparent text-gray-400 hover:text-gray-700'}
            `}
                    >
                        {tab.label}
                    </Link>
                );
            })}
        </nav>
    );
}