import React, { useState, useEffect, startTransition } from 'react';
import { searchRestaurantsOnServer, searchNearbyRestaurantsOnServer } from '../lib/google-maps';
import { Restaurant } from '../lib/restaurants';
import RestaurantsMap from './RestaurantsMap';
import PlaceAutocomplete from './PlaceAutocomplete';
import {
  MapPin,
  Star,
  Compass,
  Train,
  Clock,
  Phone,
  Globe,
  Plus,
  Check,
  Search,
  MessageSquare,
  Sparkles,
  UtensilsCrossed,
  Layers,
  HelpCircle,
  Loader2
} from 'lucide-react';
import { ItineraryItem } from '../types';

interface RestaurantsProps {
  onAddItem: (item: Omit<ItineraryItem, 'id'>) => void;
  days: number;
}

const PRESET_QUERIES = [
  { label: '🔥 전체 인기 맛집', query: 'restaurants in Osaka' },
  { label: '🍣 최고급 스시/초밥', query: 'top sushi in Osaka' },
  { label: '🍜 명품 라멘/우동', query: 'best ramen or udon in Osaka' },
  { label: '🥩 규카츠 & 야키니쿠', query: 'gyukatsu or yakiniku in Osaka' },
  { label: '🍰 예쁜 디저트 & 카페', query: 'best dessert cafe in Osaka' },
];

export default function Restaurants({ onAddItem, days }: RestaurantsProps) {
  const [query, setQuery] = useState('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 34.6691, lng: 135.5019 }); // Default Namba center
  const [targetDayGroup, setTargetDayGroup] = useState<Record<string, number>>({});
  const [addedItemNotifications, setAddedItemNotifications] = useState<Record<string, boolean>>({});
  const [apiWarning, setApiWarning] = useState(false);

  // Run initial search
  useEffect(() => {
    handleSearch('restaurants in Osaka');
  }, []);

  const handleSearch = async (targetQuery: string) => {
    setIsLoading(true);
    setSelectedRestaurantId(null);
    try {
      const results = await searchRestaurantsOnServer(targetQuery, mapCenter);
      setRestaurants(results);

      // Check if fallback mock was used (i.e. did we actually have API KEY or fallback data?)
      // Let's check center of first matched item to update center
      if (results.length > 0 && results[0].location) {
        setMapCenter({
          lat: results[0].location.lat,
          lng: results[0].location.lng,
        });
      }
    } catch (err) {
      console.error('Failed to query restaurants:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    handleSearch(query);
  };

  const handleSelectPlaceFromAutocomplete = (place: { name: string; lat: number; lng: number }) => {
    // Center map on selected place
    setMapCenter({ lat: place.lat, lng: place.lng });
    // And discover restaurants nearby this selected place!
    handleSearchWithLocation(place.name + ' restaurant', { lat: place.lat, lng: place.lng });
  };

  const handleSearchWithLocation = async (targetQuery: string, location: { lat: number; lng: number }) => {
    setIsLoading(true);
    setSelectedRestaurantId(null);
    try {
      const results = await searchRestaurantsOnServer(targetQuery, location);
      setRestaurants(results);
    } catch (err) {
      console.error('Failed to query restaurants at coordinate:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRestaurantToItinerary = (res: Restaurant) => {
    const targetDay = targetDayGroup[res.id] || 1;

    const item: Omit<ItineraryItem, 'id'> = {
      day: targetDay,
      time: '13:00', // standard food slot
      title: res.name,
      location: res.formattedAddress || '오사카 맛집',
      cost: 0,
      category: 'food',
      notes: res.editorialSummary
        ? `🔥 추천 구루메: ${res.editorialSummary} (★ ${res.rating || '4.5'})`
        : `오사카 명소 맛집 탐방! 대표 Cuisine: ${res.cuisineType || '일식 요리'} (평점: ★${res.rating || '4.5'})`,
    };

    onAddItem(item);

    // Show visual temporary "Added" checklist notification helper
    setAddedItemNotifications((prev) => ({ ...prev, [res.id]: true }));
    setTimeout(() => {
      setAddedItemNotifications((prev) => ({ ...prev, [res.id]: false }));
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Upper info panel */}
      <div className="bg-white rounded-2xl border border-rose-100 p-6 shadow-3xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-orange-500" />
              오사카 미식 탐어 & 구글 맵 실시간 맛집 서치 🍣
            </h2>
            <p className="text-xs md:text-sm text-gray-500 font-medium">
              구글 실시간 데이터베이스 연계로 오사카 전역의 진짜 맛집을 간편히 검색하고, 원클릭으로 나의 플래너 일정에 즉시 동기화해 보세요!
            </p>
          </div>
          <div className="bg-orange-50/55 border border-orange-100 rounded-xl px-3 py-2 text-[11px] text-orange-850 max-w-sm">
            <span className="font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              구글 Places API (New) 연동
            </span>
            <p className="text-gray-500 mt-0.5 leading-relaxed">
              API 미지정 시 도톤보리와 우메다 인근의 검증된 현지 추천 리스트가 상기 캐시에서 활성화됩니다.
            </p>
          </div>
        </div>

        {/* Categories preset speedtags button container */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-rose-50">
          <span className="text-xs text-gray-400 font-bold mr-1">🔥 즉시 선택:</span>
          {PRESET_QUERIES.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(item.query);
                handleSearch(item.query);
              }}
              className="bg-gray-150/45 hover:bg-orange-50 hover:text-orange-600 border border-gray-150/20 text-gray-600 rounded-lg px-2.5 py-1.5 text-xs font-semibold cursor-pointer transition-all duration-150"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main split interactive panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left lists section - 5 span out of 12 */}
        <div className="lg:col-span-6 space-y-4">
          {/* Detailed search bar with place-autocomplete input */}
          <div className="bg-white border border-rose-50 rounded-2xl p-4 shadow-3xs space-y-3">
            <span className="text-xs font-bold text-gray-700 block">🗺️ 장소 자동완성 및 맞춤형 검색</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
              <div>
                <PlaceAutocomplete
                  onSelectPlace={handleSelectPlaceFromAutocomplete}
                  placeholder="특정 역이나 랜드마크 주변 탐색..."
                />
              </div>

              <form onSubmit={handleCustomSearch} className="flex gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="예: 다코야키, 난바 스시..."
                  className="flex-1 px-3 py-1.5 md:py-2 text-xs md:text-sm border border-gray-150/90 rounded-xl bg-gray-50/50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-800"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white font-bold text-xs px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shrink-0"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>검색</span>
                </button>
              </form>
            </div>
          </div>

          {/* Restaurants Scroll List */}
          <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                <p className="text-xs text-gray-400 font-semibold">구글 실시간 맛집을 엄선하여 불러오고 있습니다...</p>
              </div>
            ) : restaurants.length === 0 ? (
              <div className="bg-white border border-stone-150/60 rounded-2xl py-12 text-center text-xs text-gray-400 font-medium">
                <div className="max-w-xs mx-auto space-y-3">
                  <span className="inline-block p-3 bg-gray-50 text-gray-300 rounded-full">🗺️</span>
                  <p>일치하는 오사카 맛집 결과가 없습니다. 다른 키워드 또는 한국어로 다시 검색해 주세요.</p>
                </div>
              </div>
            ) : (
              restaurants.map((res) => {
                const isSelected = selectedRestaurantId === res.id;
                const isAdded = addedItemNotifications[res.id];
                const selectedDay = targetDayGroup[res.id] || 1;

                return (
                  <div
                    key={res.id}
                    onClick={() => {
                      setSelectedRestaurantId(res.id);
                      if (res.location) {
                        setMapCenter({ lat: res.location.lat, lng: res.location.lng });
                      }
                    }}
                    className={`bg-white rounded-2xl p-4 border transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? 'border-orange-500 ring-4 ring-orange-50 shadow-md'
                        : 'border-gray-150/75 hover:border-orange-200'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        {/* Title and Badge */}
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-extrabold uppercase text-orange-600 bg-orange-50 px-2 py-0.5 rounded-sm">
                              {res.cuisineType || '맛집'}
                            </span>
                            {res.priceLevel && (
                              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-xs" title={res.priceLevel}>
                                JPY ¥
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-sm md:text-base text-gray-950 flex items-baseline gap-1">
                            {res.name}
                            {res.nameJa && <span className="text-xs text-gray-400 font-normal">{res.nameJa}</span>}
                          </h3>
                        </div>

                        {/* Rating */}
                        {res.rating && (
                          <div className="flex items-center gap-1 bg-amber-50 rounded-lg px-2 py-0.5 text-xs text-amber-500 font-bold shrink-0">
                            <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                            <span>{res.rating}</span>
                            {res.userRatingCount && (
                              <span className="text-[9px] text-gray-400 font-normal">
                                ({res.userRatingCount.toLocaleString()})
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Decription / editorial */}
                      {res.editorialSummary && (
                        <p className="text-gray-650 text-xs italic leading-normal border-l-2 border-orange-200 pl-2">
                          "{res.editorialSummary}"
                        </p>
                      )}

                      {/* Technical specifications */}
                      <div className="text-[11px] text-gray-500 space-y-1 bg-gray-50/50 p-2 rounded-xl">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">{res.formattedAddress}</span>
                        </div>
                        {res.nationalPhoneNumber && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>{res.nationalPhoneNumber}</span>
                          </div>
                        )}
                        {res.websiteUri && (
                          <div className="flex items-center gap-1 text-sky-600">
                            <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            <a
                              href={res.websiteUri}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="hover:underline truncate"
                            >
                              웹사이트 둘러보기
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Footer Actions Panel */}
                      <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center text-[10px] text-gray-400 font-medium">
                          영업여부: {res.openNow ? <span className="text-emerald-600 font-bold ml-1">● 활성(영업중)</span> : <span className="text-gray-400 ml-1">휴무 또는 시간외</span>}
                        </div>

                        {/* Selection & Add planner buttons */}
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center bg-gray-100 rounded px-1.5 py-0.5">
                            <select
                              value={selectedDay}
                              onChange={(e) => {
                                const newDay = Number(e.target.value);
                                setTargetDayGroup((prev) => ({ ...prev, [res.id]: newDay }));
                              }}
                              className="text-xs font-bold text-gray-700 bg-transparent py-0.5 cursor-pointer focus:outline-none border-none"
                              title="Planner target day picker"
                            >
                              {Array.from({ length: Math.max(days, 1) }).map((_, idx) => (
                                <option key={idx + 1} value={idx + 1}>
                                  Day {idx + 1}
                                </option>
                              ))}
                            </select>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAddRestaurantToItinerary(res)}
                            className={`px-3 py-1.5 border rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                              isAdded
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'bg-rose-500 border-rose-500 text-white hover:bg-rose-600 hover:scale-105'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>추가 완료!</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>일정에 추가</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Map section - 6 span out of 12 */}
        <div className="lg:col-span-6 h-[450px] lg:h-[650px] sticky top-6">
          <div className="flex items-center justify-between text-xs font-bold text-stone-500 mb-2 pl-1.5">
            <span className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-orange-500 animate-spin-slow" />
              오사카 맛집 인터랙티브 구글 맵
            </span>
            <span>수집 결과: {restaurants.length}개소</span>
          </div>

          <RestaurantsMap
            restaurants={restaurants}
            selectedRestaurantId={selectedRestaurantId}
            onSelectRestaurant={setSelectedRestaurantId}
            center={mapCenter}
          />
        </div>
      </div>
    </div>
  );
}
