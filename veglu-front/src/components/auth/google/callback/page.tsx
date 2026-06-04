'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function GoogleCallback() {
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const code = searchParams.get('code');
        if (!code) return;

        fetch('http://192.168.7.120:3000/auth/google/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
        })
            .then(res => res.json())
            .then(data => {
                if (data.accessToken) {
                    localStorage.setItem('user_token', data.accessToken);
                    localStorage.setItem('user_nickname', data.user?.nickname || '구글유저');
                    router.replace('/'); // 메인 지도로 복귀
                }
            });
    }, [searchParams, router]);

    return <div>구글 인증 처리 중...</div>;
}