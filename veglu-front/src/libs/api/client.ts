const BASE_URL = 'http://192.168.7.120:5000';

export async function apiClient(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('accessToken');

    const res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || '요청에 실패했습니다.');
    }

    // 응답이 비어있거나 텍스트면 그냥 반환
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        return res.text();
    }

    return res.json();
}