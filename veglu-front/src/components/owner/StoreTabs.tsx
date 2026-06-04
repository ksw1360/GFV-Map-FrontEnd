"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function StoreTabs({ storeId }: { storeId: string }) {
    const pathname = usePathname();

    const id = storeId || pathname.split('/')[3];

    const TABS = [
        { label: '홈',   path: `/owner/store/${id}` },
        { label: '메뉴', path: `/owner/store/${id}/menu` },
        { label: '리뷰', path: `/owner/store/${id}/reviews` },
        { label: '사진', path: `/owner/store/${id}/photos` },
    ];

    return (
        <nav className="flex justify-center border-b border-gray-200 px-5">
            {TABS.map((tab) => {
                const isActive = tab.label === '홈'
                    ? pathname === tab.path
                    : pathname.startsWith(tab.path);

                return (
                    <Link
                        key={tab.label}
                        href={tab.path}
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