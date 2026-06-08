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
        if (mapInstance.current) return;
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

    // 🎯 마커 드로잉 엔진 (파싱 규격 및 필터 안전벨트 강화)
    const drawMapMarkers = () => {
        const map = mapInstance.current;
        const clusterer = clustererInstance.current;
        if (!map || !clusterer) return;

        // 1. 잔상 초기화
        clusterer.clear();
        if (markersRef.current && markersRef.current.length > 0) {
            markersRef.current.forEach(marker => {
                if (marker) marker.setMap(null);
            });
        }
        markersRef.current = [];

        // 2. 다이렉트 타깃 인덱스 매핑 바인딩 (유실 방어선 구축)
        let targets: any[] = [];
        if (selectedIndex !== null && restaurants[selectedIndex]) {
            targets = [{ ...restaurants[selectedIndex], _originalIndex: selectedIndex }];
        } else {
            targets = restaurants.map((r, i) => ({ ...r, _originalIndex: i }));
        }

        console.log(`📍 [마커 렌더 엔진] 계산된 타깃 개수: ${targets.length}개`);

        const newMarkers = targets.map((shop: any) => {
            if (!shop) return null;

            let finalLat: number | null = null;
            let finalLng: number | null = null;

            // 주동선 A: "위도/경도" 슬래시 혹은 쉼표 파싱
            if (shop.points && typeof shop.points === 'string') {
                const separator = shop.points.includes('/') ? '/' : (shop.points.includes(',') ? ',' : null);
                if (separator) {
                    const [latStr, lngStr] = shop.points.split(separator);
                    finalLat = parseFloat(latStr.trim());
                    finalLng = parseFloat(lngStr.trim());
                }
            }

            // 주동선 B: points 유실 시 백엔드 단독 위경도 필드 역추적 가드
            if (finalLat === null || isNaN(finalLat)) {
                const fallbackLat = shop.latitude || shop.lat;
                const fallbackLng = shop.longitude || shop.lng;
                if (fallbackLat && fallbackLng) {
                    finalLat = typeof fallbackLat === 'string' ? parseFloat(fallbackLat) : fallbackLat;
                    finalLng = typeof fallbackLng === 'string' ? parseFloat(fallbackLng) : fallbackLng;
                }
            }

            // 🚀 최종 도출된 정상 위경도 좌표로 카카오 마커 낙하 격발
            if (finalLat && finalLng && !isNaN(finalLat) && !isNaN(finalLng)) {
                const markerPosition = new window.kakao.maps.LatLng(finalLat, finalLng);

                const marker = new window.kakao.maps.Marker({
                    position: markerPosition,
                    title: shop.name,
                    map: map
                });

                // 🎯 마커 직접 클릭 시 상세창 연동 링커 가동
                window.kakao.maps.event.addListener(marker, 'click', () => {
                    if (typeof onMarkerSelect === 'function') {
                        onMarkerSelect(shop._originalIndex);
                    }
                });

                return marker;
            }

            return null;
        }).filter(m => m !== null) as any[];

        // 3. 클러스터러 최종 적재
        markersRef.current = newMarkers;
        clusterer.addMarkers(newMarkers);
        console.log(`✅ [지도 마킹 완수] 정상 노출된 핀 마커 총 개수: ${newMarkers.length}개`);
    };

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
        <div className="absolute inset-0 min-w-full min-h-full bg-gray-100 z-0">
            <Script
                src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=604e9a64453d6167f7a58e8231871b49&autoload=false&libraries=clusterer"
                strategy="afterInteractive"
                onLoad={() => {
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