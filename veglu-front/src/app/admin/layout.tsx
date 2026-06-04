import Link from 'next/link';
import AdminTabs from '@/components/admin/AdminTabs';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Veglu 관리자 페이지',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-white" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
            <header className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                <Link href="/admin/users">
                    <VegluLogo />
                </Link>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                    <Link href="/logout" className="hover:text-gray-900">로그아웃</Link>
                </div>
            </header>
            <AdminTabs />
            <main>{children}</main>
        </div>
    );
}

function VegluLogo() {
    return (
        <svg width="60" height="28" viewBox="0 0 60 28" fill="none">
            <text x="0" y="22" fontFamily="Georgia, serif" fontSize="22" fontStyle="italic" fill="#4a7c59" letterSpacing="-0.5">
                Veglu
            </text>
        </svg>
    );
}