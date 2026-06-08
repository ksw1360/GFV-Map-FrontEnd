import { Metadata } from 'next';
import OwnerHeader from '@/components/owner/OwnerHeader';

export const metadata: Metadata = {
    title: 'Veglu 점주 페이지',
};

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-white" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
            <OwnerHeader />
            <main>{children}</main>
        </div>
    );
}