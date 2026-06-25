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
      <div className="w-full h-full min-h-[350px] border border-stone-200 bg-stone-50 rounded-2xl flex items-center justify-center p-6 text-center text-xs text-stone-500">
        <div>
          <p className="font-bold text-red-500 mb-2">⚠️ {loadError}</p>
          <p>구글 맵 SDK 로드 중 문제가 생겼습니다. API 키를 재설정해 보거나 로컬 네트워크를 체크해 주세요.</p>
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
