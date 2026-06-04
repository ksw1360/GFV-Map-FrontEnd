'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
    { label: '사용자', href: '/admin/users' },
    { label: '가게',   href: '/admin/stores' },
    { label: '통계',   href: '/admin/stats' },
    { label: '관리',   href: '/admin/manage' },
];

export default function AdminTabs() {
    const pathname = usePathname();

    return (
        <nav className="flex border-b border-gray-200 px-5">
            {TABS.map((tab) => {
                const isActive = pathname.startsWith(tab.href);
                return (
                    <Link
                        key={tab.label}
                        href={tab.href}
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