const BASE_URL = 'http://192.168.7.120:5000';

export async function serverApiClient(
    endpoint: string,
    options: RequestInit = {}
) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        cache: 'no-store',
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || '요청에 실패했습니다.');
    }

    return res.json();
}