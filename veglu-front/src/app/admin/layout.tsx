import AdminHeader from '@/components/admin/AdminHeader';
import AdminTabs from '@/components/admin/AdminTabs';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Veglu 관리자 페이지',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-white" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
            <AdminHeader />
            <AdminTabs />
            <main>{children}</main>
        </div>
    );
}