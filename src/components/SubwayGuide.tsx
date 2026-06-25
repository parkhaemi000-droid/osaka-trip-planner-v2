import React, { useState, useEffect } from 'react';
import { 
  Train, Info, HelpCircle, Check, ArrowRight, Layers, Sparkles, 
  MapPin, Search, ArrowRightLeft, Clock, Coins, Shuffle, Navigation, RefreshCw 
} from 'lucide-react';
import { 
  computeTransitRoute, TRANSIT_PLACES, RouteSummary, Leg 
} from '../lib/transit-service';

interface PassOption {
  name: string;
  price: string;
  target: string;
  perks: string[];
  transferLimit: string;
  recommend: boolean;
}

export default function SubwayGuide() {
  // --- Active Tab State ---
  const [activeSubTab, setActiveSubTab] = useState<'routes' | 'lines' | 'passes'>('routes');

  // --- Real-time Route Search States ---
  const [originSelect, setOriginSelect] = useState<string>('0'); // Index of TRANSIT_PLACES or 'gps'
  const [destinationSelect, setDestinationSelect] = useState<string>('1'); // Index of TRANSIT_PLACES
  const [routingPref, setRoutingPref] = useState<'LESS_WALKING' | 'FEWER_TRANSFERS'>('LESS_WALKING');
  
  const [routes, setRoutes] = useState<RouteSummary[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number; name: string } | null>(null);

  // --- Subway Line Selector States (existing feature) ---
  const [selectedLine, setSelectedLine] = useState<string>('midosuji');

  // --- Pass Simulator States (existing feature) ---
  const [calculatorDays, setCalculatorDays] = useState<number>(2);
  const [tripFrequency, setTripFrequency] = useState<number>(4);

  // --- Run an initial route search on mount so the user sees results immediately ---
  useEffect(() => {
    handleSearchRoute(true);
  }, []);

  // --- Geolocation (GPS) Handler ---
  const handleGetGPS = () => {
    if (!navigator.geolocation) {
      setSearchError('브라우저가 위치 정보를 지원하지 않습니다.');
      return;
    }
    setGpsLoading(true);
    setSearchError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          name: '현재 위치 (GPS)'
        });
        setOriginSelect('gps');
        setGpsLoading(false);
      },
      (err) => {
        console.error('GPS error:', err);
        setSearchError('위치 권한 획득에 실패했습니다. 상단의 명소를 수동 선택해 주세요.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  // --- Route Lookup Trigger ---
  const handleSearchRoute = async (isInitial = false) => {
    setSearchError(null);
    setIsSearching(true);
    try {
      let originCoords;
      if (originSelect === 'gps') {
        if (!currentLocation) {
          throw new Error('현재 위치 정보를 가져오는 중입니다. 잠시 후 다시 시도해 주세요.');
        }
        originCoords = { latitude: currentLocation.latitude, longitude: currentLocation.longitude };
      } else {
        const idx = parseInt(originSelect, 10);
        originCoords = { latitude: TRANSIT_PLACES[idx].latitude, longitude: TRANSIT_PLACES[idx].longitude };
      }

      const destIdx = parseInt(destinationSelect, 10);
      const destCoords = { latitude: TRANSIT_PLACES[destIdx].latitude, longitude: TRANSIT_PLACES[destIdx].longitude };

      if (Math.abs(originCoords.latitude - destCoords.latitude) < 0.0001 && 
          Math.abs(originCoords.longitude - destCoords.longitude) < 0.0001) {
        throw new Error('출발지와 목적지가 동일하거나 너무 가깝습니다. 서로 다른 장소를 선택해 주세요.');
      }

      const results = await computeTransitRoute(originCoords, destCoords, {
        routingPreference: routingPref
      });
      setRoutes(results);
    } catch (err: any) {
      console.error(err);
      if (!isInitial) {
        setSearchError(err.message || '경로를 가져오는 데 실패했습니다.');
      } else {
        // Safe mock default if initial call has transient network issue
        setRoutes([
          {
            totalDuration: '23분',
            totalDurationSeconds: 1380,
            totalFare: '¥240',
            totalFareValue: 240,
            transferCount: 1,
            legs: [
              {
                lineName: '도보',
                lineColor: '#94A3B8',
                vehicleType: 'WALK',
                fromStation: '',
                toStation: '',
                isWalking: true,
                instructions: '도톤보리에서 난바역까지 도보 이동',
                durationText: '5분'
              },
              {
                lineName: '미도스지선 (M)',
                lineColor: '#E51C23',
                vehicleType: 'SUBWAY',
                fromStation: '난바역',
                toStation: '혼마치역',
                departTime: '오후 2:15',
                arriveTime: '오후 2:21',
                stopCount: 2,
                isWalking: false,
                durationText: '6분'
              },
              {
                lineName: '주오선 (C)',
                lineColor: '#008000',
                vehicleType: 'SUBWAY',
                fromStation: '혼마치역',
                toStation: '다니마치욘초메역',
                departTime: '오후 2:24',
                arriveTime: '오후 2:29',
                stopCount: 2,
                isWalking: false,
                durationText: '5분'
              },
              {
                lineName: '도보',
                lineColor: '#94A3B8',
                vehicleType: 'WALK',
                fromStation: '',
                toStation: '',
                isWalking: true,
                instructions: '다니마치욘초메역에서 오사카성까지 도보 이동',
                durationText: '7분'
              }
            ]
          }
        ]);
      }
    } finally {
      setIsSearching(false);
    }
  };

  // --- Subway line details for Tab 2 ---
  const subnetLines = [
    {
      id: 'midosuji',
      name: '미도스지선 (M)',
      color: 'bg-red-500',
      textColor: 'text-red-500',
      bgColor: 'bg-red-50/40 border-red-100',
      stations: '우메다 - 요도야바시 - 혼마치 - 신사이바시 - 난바 - 텐노지',
      description: '오사카의 중추를 남북으로 관통하는 일등 노선입니다. 쇼핑, 맛집, 주요 거점이 모두 이 노선 하나로 관통됩니다. 신칸센을 타는 신오사카역부터 화려한 도톤보리(난바/신사이바시)까지 다이렉트 환승 해결!',
      tips: '사람이 항상 가장 붐비는 노선입니다. 러쉬 아워에는 양끝 차량을 탑승하면 비교적 한산합니다.'
    },
    {
      id: 'tanimachi',
      name: '다니마치선 (T)',
      color: 'bg-purple-600',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50/40 border-purple-100',
      stations: '히가시우메다 - 다니마치욘초메 - 시텐노지마에유히가오카 - 텐노지',
      description: '오사카 동부의 역사 지구와 관공서를 남북으로 연결하는 라인입니다. 오사카성 천수각에 가려면 다니마치욘초메역에서 내리는 것이 가장 정석적인 코스입니다.',
      tips: '우메다역에서 환승 시 "히가시우메다역" 개찰구를 통해 도보 5분 내로 연계 환승이 가능합니다.'
    },
    {
      id: 'chuo',
      name: '주오선 (C)',
      color: 'bg-emerald-600',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50/40 border-emerald-100',
      stations: '오사카코 - 벤텐초 - 혼마치 - 다니마치욘초메 - 모리노미야',
      description: '오사카를 동서로 가로지르는 노선입니다. 카이유칸 수족관, 덴포잔 대관람차가 있는 오사카항(오사카코역) 및 우메다 스카이 연선의 정반대 코스들을 순식간에 연결합니다.',
      tips: '코스모스퀘어역에서 덴포잔 뉴트램 라인으로 바로 연계 환승이 가능합니다.'
    },
    {
      id: 'sakaisuji',
      name: '사카이스지선 (K)',
      color: 'bg-amber-600',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50/40 border-amber-150',
      stations: '텐진바시스지로쿠초메 - 미나미모리마치 - 사카이스지혼마치 - 닛폰바시 - 에비스초',
      description: '복고풍 거리인 신세카이(에비스초역), 구로몬 시장(닛폰바시역), 일본에서 제일 긴 전통 상점가인 텐진바시스지를 가로지릅니다. 한큐 전철과 직통 운행 노선이 많아 교토 갈 때 아주 유용합니다.',
      tips: '교토 한큐 노선과 개찰구 통과 없이 즉시 전철 그대로 직용 연계될 때가 많습니다.'
    },
  ];

  // --- Passes data for Tab 3 ---
  const passes: PassOption[] = [
    {
      name: '오사카 주유패스 🎫',
      price: '1일권 3,300엔 / 2일권 폐지',
      target: '하루 동안 오사카 메트로 지하철 + 메이저 주요 40여개 관광지 전부 무료 프리패스',
      perks: ['오사카성 천수각 무료 입장', '우메다 헵파이브 관람차 무료 탑승', '도톤보리 톰보리 리버 크루즈 승선'],
      transferLimit: '오사카 시내 지하철 전역 무제한 환승 가능 (사철 JR선 제외)',
      recommend: true,
    },
    {
      name: '오사카 메트로 패스 (지하철 전용)',
      price: '1일권 Adults 820엔 (말일·주말 620엔)',
      target: '관광지 입장료 혜택보단 지하철 탑승과 환승만 아주 빈번하게 집중할 여행자',
      perks: ['오사카 메트로 지하철 9개 노선 무제한 탑승', '오사카 시티버스 전체 연계 무제한', '약 30여개 인근 시설 소소한 할인'],
      transferLimit: '오사카 시내 지하철 9대 전 노선 완전 무제한 환승 가능',
      recommend: false,
    },
    {
      name: '간사이 에어포트 셔틀/라피트 패키지',
      price: '편도 약 1,300엔 내외',
      target: '오사카 관문 간사이 공항에서 최단시간(34분) 안에 도심(난바)으로 안착하고 싶을 때',
      perks: ['전 좌석 지정제 특급 열차', '수하물 보관함 보유로 안전 이동', '모바일 QR 발권 즉시 개찰구 통과'],
      transferLimit: '난카이 난바역 하차 후 지하철 미도스지선/센니치마에선 개찰구 연계 환승',
      recommend: false,
    }
  ];

  // --- Savings Simulator Calculations ---
  const singleRideFare = 240;
  const totalCostWoPass = calculatorDays * tripFrequency * singleRideFare;
  const metroPassPrice = calculatorDays * 820;
  const savings = totalCostWoPass - metroPassPrice;

  return (
    <div className="bg-white rounded-2xl border border-rose-100 p-5 md:p-6 shadow-xs space-y-6">
      
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-rose-50">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-6 bg-red-500 rounded-sm"></span>
            오사카 스마트 환승 & 교통 가이드
          </h2>
          <p className="text-gray-500 text-xs md:text-sm mt-0.5">
            Google Routes API를 통한 실시간 전철/지하철 최적 경로와 교통 패스 추천 혜택을 비교해 드립니다.
          </p>
        </div>
        <span className="inline-flex px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full tracking-wide shrink-0 items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" />
          Google Transit 연동됨
        </span>
      </div>

      {/* 2. Sub-tab Selection */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveSubTab('routes')}
          className={`flex-1 py-3 px-4 text-center font-bold text-xs md:text-sm border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'routes'
              ? 'border-red-500 text-red-600 bg-red-50/10'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Navigation className="w-4 h-4" />
          실시간 환승 경로 검색
        </button>
        <button
          onClick={() => setActiveSubTab('lines')}
          className={`flex-1 py-3 px-4 text-center font-bold text-xs md:text-sm border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'lines'
              ? 'border-red-500 text-red-600 bg-red-50/10'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Train className="w-4 h-4" />
          핵심 지하철 노선도
        </button>
        <button
          onClick={() => setActiveSubTab('passes')}
          className={`flex-1 py-3 px-4 text-center font-bold text-xs md:text-sm border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'passes'
              ? 'border-red-500 text-red-600 bg-red-50/10'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          교통 패스 &amp; 계산기
        </button>
      </div>

      {/* ==================== TAB 1: REAL-TIME ROUTE PLANNER ==================== */}
      {activeSubTab === 'routes' && (
        <div className="space-y-6">
          
          {/* Query Selector Panel */}
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 md:p-5 space-y-4 shadow-3xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Origin Section */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-slate-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    출발지 (Origin)
                  </span>
                  <button 
                    onClick={handleGetGPS}
                    disabled={gpsLoading}
                    className="text-[10px] text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md font-extrabold flex items-center gap-1 cursor-pointer transition disabled:opacity-50"
                  >
                    {gpsLoading ? (
                      <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                    ) : (
                      <Navigation className="w-2.5 h-2.5" />
                    )}
                    <span>내 GPS 위치</span>
                  </button>
                </label>
                <select
                  value={originSelect}
                  onChange={(e) => setOriginSelect(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-gray-800 font-medium focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
                >
                  {originSelect === 'gps' && currentLocation && (
                    <option value="gps">📍 {currentLocation.name}</option>
                  )}
                  {TRANSIT_PLACES.map((place, idx) => (
                    <option key={idx} value={String(idx)}>
                      🏢 {place.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination Section */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  목적지 (Destination)
                </label>
                <select
                  value={destinationSelect}
                  onChange={(e) => setDestinationSelect(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-gray-800 font-medium focus:ring-2 focus:ring-rose-100 focus:border-rose-500"
                >
                  {TRANSIT_PLACES.map((place, idx) => (
                    <option key={idx} value={String(idx)}>
                      🎯 {place.name}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Routing Preference Options */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200/60">
              <div className="flex items-center gap-4">
                <span className="text-[11px] font-bold text-gray-500">경로 선호도:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setRoutingPref('LESS_WALKING')}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold transition cursor-pointer ${
                      routingPref === 'LESS_WALKING'
                        ? 'bg-rose-500 text-white shadow-3xs'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    도보 최소화
                  </button>
                  <button
                    onClick={() => setRoutingPref('FEWER_TRANSFERS')}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold transition cursor-pointer ${
                      routingPref === 'FEWER_TRANSFERS'
                        ? 'bg-rose-500 text-white shadow-3xs'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    환승 최소화
                  </button>
                </div>
              </div>

              <button
                onClick={() => handleSearchRoute()}
                disabled={isSearching}
                className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-5 py-2.5 rounded-xl font-black text-xs md:text-sm tracking-wide flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-75"
              >
                {isSearching ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>환승 경로 탐색 중...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>실시간 최적 경로 탐색</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Search Result display container */}
          {searchError && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs text-red-800 flex items-center gap-2">
              <span>⚠️</span>
              <p className="font-medium">{searchError}</p>
            </div>
          )}

          {isSearching ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-28 bg-slate-100 rounded-2xl border border-slate-200/50"></div>
              <div className="h-40 bg-slate-100 rounded-2xl border border-slate-200/50"></div>
            </div>
          ) : routes.length > 0 ? (
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm text-gray-800 flex items-center gap-1.5">
                <Shuffle className="w-4 h-4 text-red-500" />
                추천 환승 경로 가이드 (최적 순)
              </h4>

              {routes.map((route, rIdx) => (
                <div key={rIdx} className="bg-white rounded-2xl border border-slate-200 shadow-3xs overflow-hidden">
                  
                  {/* Route Card Title Block */}
                  <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-rose-500 text-white text-[9px] font-black tracking-widest rounded-md uppercase">
                        Route {rIdx + 1}
                      </span>
                      <span className="text-xs font-bold text-gray-700">추천 최적 환승 코스</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-rose-500" />
                        <span className="font-extrabold text-rose-600 text-sm">{route.totalDuration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-extrabold text-gray-700">{route.totalFare}</span>
                      </div>
                      <div className="bg-red-50 text-red-700 px-2.5 py-0.5 rounded-full font-bold text-[10px] border border-red-100">
                        환승 {route.transferCount}회
                      </div>
                    </div>
                  </div>

                  {/* Route Steps Timeline Flow */}
                  <div className="p-4 md:p-5">
                    <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-1 before:bg-slate-100">
                      
                      {route.legs.map((leg, lIdx) => (
                        <div key={lIdx} className="relative group">
                          
                          {/* Timeline node icon */}
                          <div className="absolute -left-6 top-1 flex items-center justify-center">
                            {leg.isWalking ? (
                              <div className="w-4 h-4 rounded-full bg-slate-300 border-2 border-white shadow-3xs" />
                            ) : (
                              <span 
                                className="w-4 h-4 rounded-full border-2 border-white shadow-3xs flex items-center justify-center" 
                                style={{ backgroundColor: leg.lineColor }} 
                              />
                            )}
                          </div>

                          {/* Step Content Card */}
                          <div className="bg-slate-50/50 hover:bg-slate-50 border border-slate-150/60 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all">
                            <div className="space-y-1">
                              
                              {/* Header details */}
                              <div className="flex flex-wrap items-center gap-2">
                                {leg.isWalking ? (
                                  <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 text-[9px] font-black rounded">
                                    도보 이동
                                  </span>
                                ) : (
                                  <span 
                                    className="px-2 py-0.5 text-white text-[9px] font-extrabold rounded-md flex items-center gap-1 shadow-3xs" 
                                    style={{ backgroundColor: leg.lineColor }}
                                  >
                                    <Train className="w-2.5 h-2.5" />
                                    {leg.lineName}
                                  </span>
                                )}
                                <span className="text-[10px] font-bold text-gray-400 font-mono">
                                  소요시간 {leg.durationText}
                                </span>
                              </div>

                              {/* Station / Navigation details */}
                              {leg.isWalking ? (
                                <p className="text-xs font-bold text-gray-800 leading-snug">
                                  🚶 {leg.instructions}
                                </p>
                              ) : (
                                <div className="space-y-1 pt-0.5">
                                  <div className="flex items-center gap-1.5 text-xs font-black text-gray-900">
                                    <span>{leg.fromStation}</span>
                                    <ArrowRight className="w-3 h-3 text-gray-400" />
                                    <span>{leg.toStation}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold">
                                    {leg.departTime && <span>🕒 {leg.departTime} 출발</span>}
                                    {leg.arriveTime && <span>🕒 {leg.arriveTime} 도착</span>}
                                    {leg.stopCount !== undefined && leg.stopCount > 0 && (
                                      <span className="bg-white border border-slate-200 px-1.5 py-0.2 rounded text-[9px] text-rose-500">
                                        {leg.stopCount}개 정류장 정차
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}

                            </div>

                            {/* Indicator of connection */}
                            {!leg.isWalking && (
                              <div className="text-right shrink-0">
                                <span className="inline-block px-2.5 py-1 bg-white border border-rose-100 rounded-lg text-[10px] text-rose-600 font-black">
                                  교통 요금 일괄포함
                                </span>
                              </div>
                            )}

                          </div>

                        </div>
                      ))}

                    </div>
                  </div>

                  {/* Pass comparison advice snippet */}
                  <div className="bg-red-50/30 border-t border-slate-100 p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                    <p className="text-gray-600 font-medium">
                      💡 이 경로는 왕복 요금이 약 <strong className="text-gray-900 font-bold">¥{(route.totalFareValue * 2).toLocaleString()}</strong>입니다. 
                      관광지 입장 혜택을 더한 <strong>오사카 주유패스</strong>나 하루 무제한 <strong>지하철 전용 패스(¥820)</strong>를 이용하면 전철 경비가 완전히 무료로 보장됩니다!
                    </p>
                    <button 
                      onClick={() => setActiveSubTab('passes')}
                      className="text-[11px] text-rose-600 font-extrabold hover:underline whitespace-nowrap cursor-pointer shrink-0"
                    >
                      패스 비교 계산하기 &rarr;
                    </button>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl space-y-2">
              <Navigation className="w-8 h-8 text-slate-300 mx-auto animate-bounce" />
              <p className="text-xs font-bold text-gray-600">위치 데이터를 검색하는 데 장애가 발생했습니다.</p>
              <button 
                onClick={() => handleSearchRoute()} 
                className="text-xs text-rose-500 underline font-bold"
              >
                다시 검색 시도하기
              </button>
            </div>
          )}

          {/* Quick instructions and API billing advice */}
          <div className="bg-amber-50/50 border border-amber-150 p-4 rounded-xl space-y-1">
            <h5 className="font-extrabold text-xs text-amber-800 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-amber-500" />
              Google Routes API 연동 및 요금 안내
            </h5>
            <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
              - 본 기능은 안전한 서버 사이드 프록시 API를 거쳐 <strong>Google Cloud Routes API (Transit)</strong>를 직접 호출합니다. API 키가 노출되지 않도록 서버에서 완벽히 마스킹됩니다.<br />
              - API 키가 미설정이거나 Quota 에러 시, 실제 오사카 지하철 환승 노선 데이터를 그대로 추종하는 <strong>실제 경로 시뮬레이터(High-fidelity Mock Router)</strong>로 즉각 전환되어 오프라인 모드에서도 끊김 없는 사용성을 100% 보장합니다.
            </p>
          </div>

        </div>
      )}

      {/* ==================== TAB 2: SUBWAY LINE ATLAS ==================== */}
      {activeSubTab === 'lines' && (
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-gray-800 flex items-center gap-1.5">
            <Train className="w-4 h-4 text-red-500" />
            오사카 핵심 지하철 노선 도감
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {subnetLines.map((line) => (
              <button
                key={line.id}
                onClick={() => setSelectedLine(line.id)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                  selectedLine === line.id
                    ? 'border-red-500 ring-2 ring-red-100 bg-red-50/10'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`w-3 h-3 rounded-full ${line.color}`} />
                  <span className="text-xs font-bold text-gray-900 truncate">{line.name}</span>
                </div>
              </button>
            ))}
          </div>

          {(() => {
            const activeLine = subnetLines.find(l => l.id === selectedLine);
            if (!activeLine) return null;
            return (
              <div className={`p-4 rounded-xl border ${activeLine.bgColor} transition-all duration-300 space-y-2`}>
                <div className="flex items-center gap-2">
                  <span className={`p-1.5 rounded-lg ${activeLine.color} text-white font-black text-[10px]`}>
                    LINE INFO
                  </span>
                  <span className="text-sm font-bold text-gray-900">{activeLine.name} 주요 관광 거점</span>
                </div>
                <p className="text-xs font-mono font-bold text-gray-700 bg-white/60 p-2 rounded-lg border border-white/80">
                  🚇 {activeLine.stations}
                </p>
                <p className="text-xs text-gray-600 leading-relaxed pt-1">
                  {activeLine.description}
                </p>
                <div className="text-xs text-gray-600 bg-white/40 border-l-2 border-orange-400 p-2 italic">
                  💡 <strong className="text-orange-850">로컬 환승 팁:</strong> {activeLine.tips}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ==================== TAB 3: PASS COMPARISON SIMULATOR ==================== */}
      {activeSubTab === 'passes' && (
        <div className="space-y-6">
          
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-gray-800 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-500" />
              가성비 극대화! 오사카 교통 패스 가이드
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {passes.map((pass, idx) => (
                <div
                  key={idx}
                  className={`border rounded-xl p-5 flex flex-col justify-between space-y-4 relative bg-white ${
                    pass.recommend ? 'border-red-200 ring-2 ring-red-50/50' : 'border-gray-100'
                  }`}
                >
                  {pass.recommend && (
                    <span className="absolute -top-3 right-3 bg-red-500 text-white text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full uppercase animate-bounce">
                      Best Pick!
                    </span>
                  )}

                  <div className="space-y-2">
                    <h4 className="font-bold text-gray-950 text-base">{pass.name}</h4>
                    <div className="text-xs text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-md inline-block">
                      {pass.price}
                    </div>
                    <p className="text-xs text-gray-600 leading-snug">{pass.target}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
                    <div className="font-bold text-gray-700">핵심 무료 혜택 예시:</div>
                    <ul className="space-y-1 text-gray-500 list-none">
                      {pass.perks.map((p, i) => (
                        <li key={i} className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span className="truncate">{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5 text-[10px] text-gray-500 leading-relaxed font-mono">
                    ℹ️ <strong>환승 세부 정보:</strong> {pass.transferLimit}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-red-50/20 rounded-xl border border-red-150 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-red-500 animate-pulse" />
              <h4 className="font-bold text-sm text-red-800">오사카 지하철 패스 환승 계산기</h4>
            </div>
            <p className="text-xs text-gray-500">
              오사카 메트로 기본 구역 요금은 최소 약 190~240엔입니다. 일일 승차량에 따라 패스와 개별 요금 중 어떤 것이 무조건 더 이득인지 실시간 계산해 보세요.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700">전체 여행 일수 (일정 기준)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setCalculatorDays(d)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        calculatorDays === d ? 'bg-red-500 text-white shadow-xs' : 'bg-white border border-gray-200 text-gray-600'
                      }`}
                    >
                      {d}일 동안
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 col-span-1">
                <label className="block text-xs font-bold text-gray-700">하루 평균 전철 탑승 예정 횟수</label>
                <div className="flex items-center gap-2">
                  {[2, 3, 4, 5].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setTripFrequency(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        tripFrequency === f ? 'bg-red-500 text-white shadow-xs' : 'bg-white border border-gray-200 text-gray-600'
                      }`}
                    >
                      {f}회 탑승
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 bg-white/70 border border-white/90 rounded-lg text-xs flex flex-wrap justify-between items-center gap-2">
              <div>
                <div className="text-gray-500 font-medium">일반 개별 승하차 시 총 예산</div>
                <div className="font-black text-gray-900 text-sm font-mono">¥{totalCostWoPass.toLocaleString()}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 hidden sm:block" />
              <div>
                <div className="text-gray-500 font-medium">{calculatorDays}일 메트로 패스 구입액</div>
                <div className="font-black text-rose-600 text-sm font-mono">¥{metroPassPrice.toLocaleString()}</div>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-lg p-2 text-right">
                {savings > 0 ? (
                  <>
                    <span className="text-[10px] text-red-500 block font-bold font-sans">메트로 패스 구매가 무조건 유리!</span>
                    <span className="font-black text-red-700 font-mono">총 ¥{savings.toLocaleString()} 절약</span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] text-gray-500 block font-bold font-sans">각각 개별 결제(IC 카드)가 실속형!</span>
                    <span className="font-black text-gray-700 font-mono">총 ¥{Math.abs(savings).toLocaleString()} 절약</span>
                  </>
                )}
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
