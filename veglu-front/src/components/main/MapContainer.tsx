'use client';

import React, { useEffect, useRef } from 'react';
import Script from 'next/script';

interface Restaurant {
    restaurantId: number;
    name: string;
    address: string;
    points: string; // "위도/경도" 슬래시 문자열 구조
    matchedMenus: string[];
    veganType: string;
}

interface MapContainerProps {
    restaurants: Restaurant[];
    selectedIndex: number | null;
}

export default function MapContainer({ restaurants, selectedIndex }: MapContainerProps) {
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

        console.log("📍 [지도 마킹 엔진 개시] 수입된 식당 개수:", restaurants.length);

        if (restaurants.length > 0) {
            console.log("🔍 백엔드가 준 첫 번째 식당 실물 명세 데이터 원본:", restaurants[0]);
        }

        clusterer.clear();
        if (markersRef.current && markersRef.current.length > 0) {
            markersRef.current.forEach(marker => {
                if (marker) marker.setMap(null);
            });
        }
        markersRef.current = [];

        const newMarkers = restaurants.map((shop: any) => {
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
                return marker;
            }

            console.warn(`⚠️ [좌표 유실 경고] '${shop.name}' 식당의 좌표 정보를 파싱할 수 없어 마킹에서 제외됨. 원본 points:`, shop.points);
            return null;
        }).filter(m => m !== null) as any[];

        markersRef.current = newMarkers;
        clusterer.addMarkers(newMarkers);

        console.log(`✅ [마킹 성공 완료] 최종 지도에 주입된 핀 마커 개수: ${newMarkers.length}개`);
    };

    // ──────────────────────────────────────────────────────────
    // 🎯 [2중 안전벨트 장착] 다른 페이지에서 뒤로 가기로 복귀 시 무조건 지도를 복구시키는 핵심 트리거
    // ──────────────────────────────────────────────────────────
    useEffect(() => {
        // 마이페이지에서 돌아왔을 때 이미 브라우저 전역 메모리에 kakao API가 안착해 있다면
        if (typeof window !== 'undefined' && window.kakao && window.kakao.maps) {
            console.log("🔄 다른 페이지에서 복귀 감지 - 카카오 인프라 즉시 재부팅 트리거 가동");
            window.kakao.maps.load(() => {
                initKakaoMap();
            });
        }
    }, []); // 💡 컴포넌트가 화면에 마운트(재부팅)될 때 단 1회 강제 실행
    // ──────────────────────────────────────────────────────────

    useEffect(() => {
        if (mapInstance.current) {
            drawMapMarkers();
        }
    }, [restaurants]);

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
                console.log(`🚀 [인덱스 저격 무빙] 지도를 '${targetShop.name}' 매장으로 워프합니다.`);
                map.panTo(moveLocation);
            }
        }
    }, [selectedIndex, restaurants]);

    return (
        <div className="absolute inset-0 min-w-full min-h-full bg-gray-100 z-0">
            <Script
                src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=604e9a64453d6167f7a58e8231871b49&autoload=false&libraries=clusterer"
                strategy="afterInteractive"
                onLoad={() => {
                    // 처음 웹사이트 주소를 치고 최초 진입할 때 실행되는 통로
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