import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Veglu 점주 페이지',
};

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-white" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
            <Header />
            <main>{children}</main>
        </div>
    );
}

function Header() {
    return (
        <header className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <Link href="/owner/dashboard">
                <VegluLogo />
            </Link>
            <div className="flex items-center gap-4 text-sm text-gray-600">
                <Link href="/login" className="hover:text-gray-900">로그아웃</Link>
            </div>
        </header>
    );
}

function VegluLogo() {
    return (
        <svg width="60" height="28" viewBox="0 0 60 28" fill="none">
            <text
                x="0" y="22"
                fontFamily="Georgia, serif"
                fontSize="22"
                fontStyle="italic"
                fill="#4a7c59"
                letterSpacing="-0.5"
            >
                Veglu
            </text>
        </svg>
    );
}