import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '../lib/google-maps-loader';
import { Restaurant } from '../lib/restaurants';
import { Loader2 } from 'lucide-react';

interface RestaurantsMapProps {
  restaurants: Restaurant[];
  selectedRestaurantId: string | null;
  onSelectRestaurant: (id: string | null) => void;
  center: { lat: number; lng: number };
}

export default function RestaurantsMap({
  restaurants,
  selectedRestaurantId,
  onSelectRestaurant,
  center,
}: RestaurantsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const activeInfoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  // 1. Load Google Maps JS SDK
  useEffect(() => {
    loadGoogleMaps()
      .then(() => setIsLoaded(true))
      .catch((err) => {
        console.error('Error loading Google Maps inside RestaurantsMap:', err);
        setLoadError(err.message || '지도 로드에 실패했습니다.');
      });
  }, []);

  // 2. Initialize Map once loaded
  useEffect(() => {
    if (!isLoaded || !containerRef.current || mapRef.current) return;

    mapRef.current = new google.maps.Map(containerRef.current, {
      center: center,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      styles: [
        {
          featureType: 'poi.business',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }], // Simplify map by hiding busy Google business pins
        },
      ],
    });
  }, [isLoaded, center]);

  // 3. Pan the map when center or selectedRestaurantId changes
  useEffect(() => {
    if (!mapRef.current) return;

    if (selectedRestaurantId) {
      const selected = restaurants.find((r) => r.id === selectedRestaurantId);
      if (selected && selected.location) {
        mapRef.current.panTo({
          lat: selected.location.lat,
          lng: selected.location.lng,
        });
        mapRef.current.setZoom(15);
      }
    } else {
      mapRef.current.panTo(center);
    }
  }, [selectedRestaurantId, center, restaurants]);

  // 4. Update Markers when restaurants list changes
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Clear open InfoWindows
    if (activeInfoWindowRef.current) {
      activeInfoWindowRef.current.close();
      activeInfoWindowRef.current = null;
    }

    const bounds = new google.maps.LatLngBounds();
    let validLocCount = 0;

    restaurants.forEach((res) => {
      if (!res.location || typeof res.location.lat !== 'number' || typeof res.location.lng !== 'number') return;

      const position = { lat: res.location.lat, lng: res.location.lng };
      bounds.extend(position);
      validLocCount++;

      // Create a native Google map marker
      const marker = new google.maps.Marker({
        position,
        map: mapRef.current!,
        title: res.name,
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: selectedRestaurantId === res.id ? '#f43f5e' : '#f97316', // Rose for selected, orange for regular
          fillOpacity: 0.95,
          strokeWeight: 2,
          strokeColor: '#ffffff',
        },
      });

      // Handle marker click
      marker.addListener('click', () => {
        onSelectRestaurant(res.id);

        if (activeInfoWindowRef.current) {
          activeInfoWindowRef.current.close();
        }

        const combinedTitle = res.nameJa ? `${res.name} (${res.nameJa})` : res.name;
        const ratingStars = res.rating ? `★ ${res.rating}` : '별점 없음';
        const reviews = res.userRatingCount ? `(${res.userRatingCount.toLocaleString()}개의 후기)` : '';
        const opTag = res.openNow !== undefined ? (res.openNow ? `<span style="background-color:#ecfdf5;color:#059669;font-weight:bold;padding:2px 6px;border-radius:4px;font-size:9.5px;">영업 중</span>` : `<span style="background-color:#fef2f2;color:#dc2626;font-weight:bold;padding:2px 6px;border-radius:4px;font-size:9.5px;">영업 종료 / 확인 필요</span>`) : '';
        const editorial = res.editorialSummary ? `<p style="margin:8px 0 0 0;font-size:11px;color:#374151;line-height:1.4;background-color:#fffbeb;padding:6px;border-radius:6px;border-left:3px solid #f59e0b;font-style:italic;">"${res.editorialSummary}"</p>` : '';

        // Generate content HTML
        const contentString = `
          <div style="font-family:'Pretendard', 'Inter', sans-serif;padding:8px;max-width:265px;text-align:left;line-height:1.4;">
            <div style="display:flex;align-items:center;flex-wrap:wrap;gap:6px;font-size:11px;margin-bottom:6px;">
              <span style="background-color:#fff5f5;color:#e11d48;font-weight:bold;padding:2px 6px;border-radius:4px;font-size:10px;">
                ${res.cuisineType || '맛집'}
              </span>
              <strong style="color:#d97706;font-weight:700;display:flex;align-items:center;gap:2px;">${ratingStars}</strong>
              <span style="color:#6b7280;font-size:10px;">${reviews}</span>
            </div>
            <h4 style="margin:4px 0;font-size:14px;font-weight:800;color:#111827;letter-spacing:-0.025em;line-height:1.3;">${combinedTitle}</h4>
            <p style="margin:4px 0 0 0;font-size:10.5px;color:#4b5563;">📍 ${res.formattedAddress || '주소 정보 미등록'}</p>
            ${editorial}
            <div style="margin-top:10px;border-top:1px solid #f3f4f6;padding-top:8px;display:flex;justify-content:space-between;align-items:center;">
              ${opTag}
            </div>
          </div>
        `;

        const infoWindow = new google.maps.InfoWindow({
          content: contentString,
        });

        infoWindow.open(mapRef.current!, marker);
        activeInfoWindowRef.current = infoWindow;
      });

      markersRef.current.push(marker);

      // Auto trigger InfoWindow popup if this is pre-selected
      if (selectedRestaurantId === res.id) {
        google.maps.event.trigger(marker, 'click');
      }
    });

    // Fit map bounds to fit all markers if we have multiple
    if (validLocCount > 1 && !selectedRestaurantId) {
      mapRef.current.fitBounds(bounds);
      // Don't zoom in extremely close if there's only 2 markers side-by-side
      const listener = google.maps.event.addListener(mapRef.current, 'bounds_changed', () => {
        if (mapRef.current && mapRef.current.getZoom()! > 16) {
          mapRef.current.setZoom(16);
        }
        google.maps.event.removeListener(listener);
      });
    }
  }, [isLoaded, restaurants, selectedRestaurantId]);

  if (loadError) {
    return (
      <div className="w-full h-full min-h-[450px] border border-rose-100 bg-white rounded-2xl flex items-center justify-center p-6 text-center shadow-3xs">
        <div className="max-w-md space-y-4">
          <div className="mx-auto w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center font-bold text-xl">
            🔑
          </div>
          <h3 className="text-sm md:text-base font-bold text-gray-900">구글 지도(Google Maps) 및 맛집 검색 활성화 안내</h3>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            실시간 오사카 음식점 탐색 및 평점 조회를 위해 구글 지도 API 키 연동이 필요합니다.
          </p>
          
          <div className="bg-gray-50/70 rounded-xl p-4 border border-gray-150/50 text-left text-[11px] space-y-3">
            <div>
              <span className="block font-bold text-gray-800">1️⃣ AI Studio Secrets에 키 추가 방법:</span>
              <ul className="list-disc pl-4 text-gray-600 mt-1 space-y-0.5 leading-relaxed">
                <li>우측 상단 ⚙️ <strong className="text-gray-900">Settings</strong> → <strong className="text-gray-900">Secrets</strong> 메뉴 클릭</li>
                <li>이름에 <code className="bg-gray-150 px-1 py-0.5 rounded font-mono text-rose-600 text-[10px]">GOOGLE_MAPS_PLATFORM_KEY</code> 입력 후 추가</li>
                <li>실제 발급 받으신 구글 맵 API 키 값을 입력하고 저장하세요.</li>
              </ul>
            </div>
            
            <div className="border-t border-gray-150/40 pt-2">
              <span className="block font-bold text-gray-800">2️⃣ 구글 클라우드 콘솔 설정 확인법:</span>
              <ul className="list-disc pl-4 text-gray-600 mt-1 space-y-0.5 leading-relaxed">
                <li>구글 클라우드 콘솔 왼쪽 위 삼선(☰) 메뉴 클릭 → <strong className="text-gray-900">[API 및 서비스] &gt; [라이브러리]</strong>로 이동</li>
                <li><strong className="text-gray-900">Maps JavaScript API</strong> 및 <strong className="text-gray-900">Places API (New)</strong>를 각각 검색하여 <strong className="text-emerald-600">사용(Enable)</strong> 버튼을 눌러주세요.</li>
                <li>키에 HTTP 리referrer 제한을 거셨다면, 현재 앱 주소인 <code className="bg-gray-150 px-1 text-[10px] rounded">*.run.app/*</code>가 허용되어 있는지 확인해 주세요.</li>
              </ul>
            </div>
          </div>
          
          <p className="text-[10px] text-orange-600 font-semibold">
            💡 팁: API 키 설정이 비어 있는 동안에도 내장된 캐시 및 오사카 명품 맛집 6대 가이드(아치치혼포, 이치란, 하루코마 등) 시뮬레이션 목록은 정상 검색·일정 등록이 가능합니다!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[350px] rounded-2xl overflow-hidden border border-gray-100 shadow-2xs">
      {!isLoaded && (
        <div className="absolute inset-0 z-50 bg-stone-50/70 backdrop-blur-xs flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
            <span className="text-xs text-stone-600 font-semibold">인터랙티브 리얼타임 맵 탑재 중...</span>
          </div>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full min-h-[350px]" id="restaurants-gmap-container" />
    </div>
  );
}
