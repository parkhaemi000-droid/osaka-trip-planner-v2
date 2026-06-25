import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useAdvancedMarkerRef, useMap } from '@vis.gl/react-google-maps';
import { Landmark } from '../types';
import { Star, MapPin, Compass, Train } from 'lucide-react';

const API_KEY =
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = 
  Boolean(API_KEY) && 
  API_KEY !== 'YOUR_API_KEY' && 
  API_KEY !== 'MY_GOOGLE_MAPS_PLATFORM_KEY' && 
  API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY' &&
  !API_KEY.includes('PLACEHOLDER') &&
  API_KEY.length > 20;

interface OsakaMapProps {
  landmarks: Landmark[];
  selectedLandmarkId: string | null;
  onSelectLandmark: (id: string | null) => void;
  onAddLandmarkToItinerary: (landmark: Landmark, targetDay: number | null) => void;
  days: number;
}

// Inner helper component to pan the map dynamically when selectedLandmarkId changes
function MapController({ selectedLandmarkId, landmarks }: { selectedLandmarkId: string | null; landmarks: Landmark[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !selectedLandmarkId) return;
    const target = landmarks.find((l) => l.id === selectedLandmarkId);
    if (target && target.lat && target.lng) {
      map.panTo({ lat: target.lat, lng: target.lng });
      map.setZoom(14);
    }
  }, [map, selectedLandmarkId, landmarks]);

  return null;
}

// Interactive Marker component with InfoWindow tethered with useAdvancedMarkerRef
function MarkerWithWindow({
  landmark,
  isOpen,
  onOpen,
  onClose,
  onAdd,
  days,
}: {
  key?: string;
  landmark: Landmark;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onAdd: (targetDay: number) => void;
  days: number;
}) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [targetDay, setTargetDay] = useState<number>(1);

  if (!landmark.lat || !landmark.lng) return null;

  const getCatColor = () => {
    if (landmark.category === 'food') return '#f59e0b'; // amber
    if (landmark.category === 'shopping') return '#ec4899'; // pink
    return '#f43f5e'; // rose-500
  };

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: landmark.lat, lng: landmark.lng }}
        onClick={onOpen}
        title={landmark.name}
      >
        <Pin
          background={getCatColor()}
          borderColor="#ffffff"
          glyphColor="#ffffff"
          scale={1.15}
        />
      </AdvancedMarker>

      {isOpen && (
        <InfoWindow
          anchor={marker}
          onCloseClick={onClose}
          headerDisabled={true}
        >
          <div className="p-2 max-w-xs text-xs space-y-2">
            <div>
              <div className="flex items-center gap-1">
                <span className="bg-rose-50 text-rose-600 font-bold px-1 py-0.5 rounded text-[8px] uppercase">
                  {landmark.category === 'food' ? '맛집' : landmark.category === 'shopping' ? '쇼핑' : '관광지'}
                </span>
                <span className="flex items-center gap-0.5 font-bold text-amber-500 text-[10px]">
                  ★ {landmark.rating}
                </span>
              </div>
              <h4 className="font-bold text-gray-900 text-sm mt-0.5">{landmark.name}</h4>
              <p className="text-[10px] text-gray-400 font-mono mt-0.5">{landmark.nameJa}</p>
            </div>

            <p className="text-gray-600 leading-snug text-[11px] line-clamp-2">
              {landmark.description}
            </p>

            <div className="flex items-center gap-1 text-[10px] text-gray-500 bg-gray-50 p-1 rounded">
              <Train className="w-3 h-3 text-gray-400 shrink-0" />
              <span className="truncate">{landmark.nearestStation}</span>
            </div>

            <div className="flex items-center gap-1.5 pt-1.5 border-t border-gray-100 justify-between">
              <div className="flex items-center bg-gray-100 rounded px-1 py-0.5">
                <select
                  value={targetDay}
                  onChange={(e) => setTargetDay(Number(e.target.value))}
                  className="text-[10px] font-bold text-gray-700 bg-transparent focus:outline-none border-none cursor-pointer"
                  title="Day selection"
                >
                  {Array.from({ length: Math.max(days, 1) }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Day {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => onAdd(targetDay)}
                className="bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold py-1 px-2.5 rounded transition cursor-pointer"
              >
                일정에 추가
              </button>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

export default function OsakaMap({
  landmarks,
  selectedLandmarkId,
  onSelectLandmark,
  onAddLandmarkToItinerary,
  days,
}: OsakaMapProps) {
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedLandmarkId) {
      setActiveWindowId(selectedLandmarkId);
    }
  }, [selectedLandmarkId]);

  if (!hasValidKey) {
    return (
      <div className="w-full h-[500px] border border-stone-200 rounded-2xl bg-stone-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <div className="mx-auto w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
            <MapPin className="w-6 h-6 animate-bounce" />
          </div>
          <h3 className="text-base font-bold text-gray-900">구글 지도(Google Maps) 연동 활성화 안내</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            오사카 인기 명소들의 지리적 위치 시각화 및 노선 탐색을 지도에서 만나보실 수 있습니다. 원활한 지도 가동을 위해 API 키 설정이 필요합니다.
          </p>
          <div className="bg-white rounded-xl p-4 border border-stone-100 text-left text-xs space-y-2">
            <span className="block font-bold text-gray-800">🔑 구글 지도 API 키 등록 방법:</span>
            <ul className="list-decimal pl-4 text-stone-600 space-y-1 leading-snug">
              <li>우측 상단 톱니바퀴 마스터 <strong className="text-gray-900">Settings</strong>를 클릭합니다.</li>
              <li>하위 <strong className="text-gray-900">Secrets</strong> 패널을 클릭합니다.</li>
              <li>이름에 <code className="bg-stone-100 px-1 py-0.5 rounded font-mono text-red-600 text-[10px]">GOOGLE_MAPS_PLATFORM_KEY</code>를 입력합니다.</li>
              <li>소지하고 계신 구글 맵스 API 복사본을 붙여 넣고 엔터(Enter)를 입력합니다.</li>
            </ul>
          </div>
          <p className="text-[10px] text-sky-600 font-semibold italic">
            💡 위 설정을 완료하시면 페이지 새로고침 없이 즉시 인터랙티브 3D 주도가 나타납니다!
          </p>
        </div>
      </div>
    );
  }

  // 34.675, 135.495 is roughly the center of central Osaka (Umeda to Namba middle)
  const defaultCenter = { lat: 34.675, lng: 135.495 };

  return (
    <div className="relative border border-gray-100/80 rounded-2xl overflow-hidden shadow-2xs h-[500px] w-full">
      <APIProvider apiKey={API_KEY} version="weekly">
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={12}
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%' }}
          gestureHandling="cooperative"
          disableDefaultUI={false}
        >
          <MapController selectedLandmarkId={selectedLandmarkId} landmarks={landmarks} />

          {landmarks.map((landmark) => (
            <MarkerWithWindow
              key={landmark.id}
              landmark={landmark}
              isOpen={activeWindowId === landmark.id}
              onOpen={() => {
                onSelectLandmark(landmark.id);
                setActiveWindowId(landmark.id);
              }}
              onClose={() => {
                if (activeWindowId === landmark.id) {
                  setActiveWindowId(null);
                  onSelectLandmark(null);
                }
              }}
              onAdd={(day) => {
                onAddLandmarkToItinerary(landmark, day);
              }}
              days={days}
            />
          ))}
        </Map>
      </APIProvider>
    </div>
  );
}
