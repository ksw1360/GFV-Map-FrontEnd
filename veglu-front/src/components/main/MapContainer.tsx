'use client';

import React, { useEffect, useRef } from 'react';
import Script from 'next/script';

interface Restaurant {
    restaurantId: number;
    name: string;
    address: string;
    points: string;
    matchedMenus: string[];
    veganType: string;
}

interface MapContainerProps {
    restaurants: Restaurant[];
    selectedIndex: number | null;
    onMarkerSelect: (index: number) => void;
}

export default function MapContainer({ restaurants, selectedIndex, onMarkerSelect }: MapContainerProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const clustererInstance = useRef<any>(null);
    const markersRef = useRef<any[]>([]);

    const initKakaoMap = () => {
        // 💡 [안전 가드] 이미 지도가 존재한다면 중복 생성을 막고 마커만 새로 그립니다.
        if (mapInstance.current) {
            drawMapMarkers();
            return;
        }
        if (!mapContainerRef.current) return;

        const container = mapContainerRef.current;
        const options = {
            center: new window.kakao.maps.LatLng(37.5172, 127.0473),
            level: 4,
        };

        const map = new window.kakao.maps.Map(container, options);
        mapInstance.current = map;

        clustererInstance.current = new window.kakao.maps.MarkerClusterer({
            map: map,
            averageCenter: true,
            minLevel: 6,
        });

        drawMapMarkers();
    };

    const drawMapMarkers = () => {
        const map = mapInstance.current;
        const clusterer = clustererInstance.current;
        if (!map || !clusterer) return;

        clusterer.clear();
        if (markersRef.current && markersRef.current.length > 0) {
            markersRef.current.forEach(marker => {
                if (marker) marker.setMap(null);
            });
        }
        markersRef.current = [];

        let targets: any[] = [];
        if (selectedIndex !== null && restaurants[selectedIndex]) {
            targets = [{ ...restaurants[selectedIndex], _originalIndex: selectedIndex }];
        } else {
            targets = restaurants.map((r, i) => ({ ...r, _originalIndex: i }));
        }

        const newMarkers = targets.map((shop: any) => {
            if (!shop) return null;

            let finalLat: number | null = null;
            let finalLng: number | null = null;

            if (shop.points && typeof shop.points === 'string') {
                const separator = shop.points.includes('/') ? '/' : (shop.points.includes(',') ? ',' : null);
                if (separator) {
                    const [latStr, lngStr] = shop.points.split(separator);
                    finalLat = parseFloat(latStr.trim());
                    finalLng = parseFloat(lngStr.trim());
                }
            }

            if (finalLat === null || isNaN(finalLat)) {
                const fallbackLat = shop.latitude || shop.lat;
                const fallbackLng = shop.longitude || shop.lng;
                if (fallbackLat && fallbackLng) {
                    finalLat = typeof fallbackLat === 'string' ? parseFloat(fallbackLat) : fallbackLat;
                    finalLng = typeof fallbackLng === 'string' ? parseFloat(fallbackLng) : fallbackLng;
                }
            }

            if (finalLat && finalLng && !isNaN(finalLat) && !isNaN(finalLng)) {
                const markerPosition = new window.kakao.maps.LatLng(finalLat, finalLng);

                const marker = new window.kakao.maps.Marker({
                    position: markerPosition,
                    title: shop.name,
                    map: map
                });

                window.kakao.maps.event.addListener(marker, 'click', () => {
                    if (typeof onMarkerSelect === 'function') {
                        onMarkerSelect(shop._originalIndex);
                    }
                });

                return marker;
            }
            return null;
        }).filter(m => m !== null) as any[];

        markersRef.current = newMarkers;
        clusterer.addMarkers(newMarkers);
    };

    useEffect(() => {
        // 마이페이지에서 뒤로가기나 링크로 돌아왔을 때 이미 브라우저 전역 메모리에 kakao API가 로드되어 있다면
        if (typeof window !== 'undefined' && window.kakao && window.kakao.maps) {
            console.log("🔄 [인프라 재부팅] 다른 페이지에서 복귀가 감지되어 카카오맵 엔진을 즉시 리프레시 부팅합니다.");
            window.kakao.maps.load(() => {
                initKakaoMap();
            });
        }
    }, []);

    useEffect(() => {
        if (mapInstance.current) {
            drawMapMarkers();
        }
    }, [restaurants, selectedIndex]);

    // 사이드바나 마커 초점 변경 시 부드럽게 카메라 슬라이딩 시키는 훅
    useEffect(() => {
        const map = mapInstance.current;
        if (!map || selectedIndex === null) return;

        const targetShop = restaurants[selectedIndex];
        if (targetShop) {
            let finalLat: number | null = null;
            let finalLng: number | null = null;

            if (targetShop.points && typeof targetShop.points === 'string') {
                const separator = targetShop.points.includes('/') ? '/' : (targetShop.points.includes(',') ? ',' : null);
                if (separator) {
                    const [latStr, lngStr] = targetShop.points.split(separator);
                    finalLat = parseFloat(latStr.trim());
                    finalLng = parseFloat(lngStr.trim());
                }
            }

            if (finalLat === null || isNaN(finalLat)) {
                const fallbackLat = (targetShop as any).latitude || (targetShop as any).lat;
                const fallbackLng = (targetShop as any).longitude || (targetShop as any).lng;
                if (fallbackLat && fallbackLng) {
                    finalLat = typeof fallbackLat === 'string' ? parseFloat(fallbackLat) : fallbackLat;
                    finalLng = typeof fallbackLng === 'string' ? parseFloat(fallbackLng) : fallbackLng;
                }
            }

            if (finalLat && finalLng && !isNaN(finalLat) && !isNaN(finalLng)) {
                const moveLocation = new window.kakao.maps.LatLng(finalLat, finalLng);
                setTimeout(() => {
                    map.panTo(moveLocation);
                }, 50);
            }
        }
    }, [selectedIndex]);

    return (
        <div className="relative w-full h-full bg-gray-100 z-0">
            <Script
                src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=604e9a64453d6167f7a58e8231871b49&autoload=false&libraries=clusterer"
                strategy="afterInteractive"
                onLoad={() => {
                    // 최초 사이트 접속 시 깨어나는 통로
                    if (window.kakao && window.kakao.maps) {
                        window.kakao.maps.load(initKakaoMap);
                    }
                }}
            />
            <div ref={mapContainerRef} className="w-full h-full" />
        </div>
    );
}

declare global {
    interface Window {
        kakao: any;
    }
}