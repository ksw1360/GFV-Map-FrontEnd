'use client';

import { useState } from 'react';
import Link from 'next/link';
import UserCard from '@/components/admin/UserCard';

const DUMMY_USERS = [
    { id: '1', email: 'abcd1234@gmail.com', role: '사용자' },
    { id: '2', email: 'abcd1234@gmail.com', role: '점주' },
    { id: '3', email: 'cccc1234@gmail.com', role: '점주' },
    { id: '4', email: '가나다라마바사', role: '사용자' },
];

export default function UsersPage() {
    const [search, setSearch] = useState('');

    const filtered = DUMMY_USERS.filter((user) =>
        user.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-lg mx-auto px-5 py-6">
            {/* 검색바 + 사이렌 버튼 */}
            <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2">
                    <SearchIcon />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="이메일 또는 닉네임 검색"
                        className="flex-1 text-sm outline-none placeholder:text-gray-300"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="text-gray-300 hover:text-gray-500">
                            <ClearIcon />
                        </button>
                    )}
                </div>
                <Link href="/admin/users/reports">
                    <button className="p-2 text-gray-400 hover:text-red-500 transition-colors" aria-label="신고 리뷰 보기">
                        <SirenIcon />
                    </button>
                </Link>
            </div>

            {/* 유저 목록 */}
            <ul className="flex flex-col gap-3">
                {filtered.length > 0 ? (
                    filtered.map((user) => (
                        <li key={user.id}>
                            <UserCard user={user} />
                        </li>
                    ))
                ) : (
                    <p className="text-sm text-gray-400 text-center py-10">검색 결과가 없습니다.</p>
                )}
            </ul>
        </div>
    );
}

function SearchIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
    );
}

function ClearIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
    );
}

function SirenIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18.364 5.636a9 9 0 0 1 0 12.728"/>
            <path d="M5.636 5.636a9 9 0 0 0 0 12.728"/>
            <path d="M12 2v2"/>
            <path d="M12 8v4l3 3"/>
            <circle cx="12" cy="14" r="4"/>
        </svg>
    );
}