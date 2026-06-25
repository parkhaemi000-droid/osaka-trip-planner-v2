import React, { useState } from 'react';
import { MapPin, Compass, Train, Clock, Pocket, Star, Plus, Check, Map as MapIcon, List } from 'lucide-react';
import { Landmark } from '../types';
import { OSAKA_LANDMARKS } from '../data';
import OsakaMap from './OsakaMap';

interface HotspotsProps {
  onAddLandmarkToItinerary: (landmark: Landmark, targetDay: number) => void;
  days: number;
}

export default function Hotspots({ onAddLandmarkToItinerary, days }: HotspotsProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedDayToAdd, setSelectedDayToAdd] = useState<Record<string, number>>({});
  const [addedNotifications, setAddedNotifications] = useState<Record<string, boolean>>({});
  const [selectedLandmarkId, setSelectedLandmarkId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'both' | 'map' | 'list'>('both');

  const filteredLandmarks = activeCategory === 'all'
    ? OSAKA_LANDMARKS
    : OSAKA_LANDMARKS.filter((l) => l.category === activeCategory);

  const triggerAdd = (landmark: Landmark, customDay?: number) => {
    const day = customDay || selectedDayToAdd[landmark.id] || 1;
    onAddLandmarkToItinerary(landmark, day);

    // Show temporary "Added!" indicator feedback
    setAddedNotifications((prev) => ({ ...prev, [landmark.id]: true }));
    setTimeout(() => {
      setAddedNotifications((prev) => ({ ...prev, [landmark.id]: false }));
    }, 2000);
  };

  const handleDaySelect = (landmarkId: string, dayNum: number) => {
    setSelectedDayToAdd((prev) => ({ ...prev, [landmarkId]: dayNum }));
  };

  const focusOnMapAndLandmark = (landmark: Landmark) => {
    if (landmark.lat && landmark.lng) {
      setSelectedLandmarkId(landmark.id);
      const mapElem = document.getElementById('osaka-google-map');
      if (mapElem) {
        mapElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-rose-100 p-6 shadow-xs space-y-6">
      {/* 1. Header Portion with togglable categories */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-rose-50">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-6 bg-orange-500 rounded-sm"></span>
            오사카 인기 명소 사전 & 실시간 주도 🗺️
          </h2>
          <p className="text-gray-500 text-xs md:text-sm mt-0.5 font-medium">
            현지 정보와 꿀팁을 대조하고, 지도를 움직여 직관적으로 확인보세요. 원클릭으로 일정이 즉각 연계됩니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filters */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-sm">
            {['all', 'sightseeing', 'food', 'shopping'].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setSelectedLandmarkId(null);
                }}
                className={`px-3 py-1.5 rounded text-xs font-semibold uppercase cursor-pointer transition-all duration-150 ${
                  activeCategory === cat
                    ? 'bg-white text-gray-950 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {cat === 'all' ? '전체' : cat === 'sightseeing' ? '관광' : cat === 'food' ? '맛집' : '쇼핑'}
              </button>
            ))}
          </div>

          {/* Desktop/Mobile Layout Helper Selector buttons */}
          <div className="hidden sm:flex items-center gap-1 bg-rose-50 p-1 rounded">
            <button
              onClick={() => setViewMode('both')}
              className={`p-1.5 rounded text-xs font-medium cursor-pointer flex items-center gap-1 ${viewMode === 'both' ? 'bg-rose-500 text-white' : 'text-rose-600'}`}
              title="Split View"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>분할</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded text-xs font-medium cursor-pointer flex items-center gap-0.5 ${viewMode === 'list' ? 'bg-rose-500 text-white' : 'text-rose-600'}`}
              title="List Only"
            >
              <List className="w-3.5 h-3.5" />
              <span>목록</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Content Split Panel */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left lists: Landmarks Grid */}
        <div className={`space-y-6 flex-1 ${viewMode === 'map' ? 'hidden' : 'block'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLandmarks.map((landmark) => {
              const isExpanded = expandedId === landmark.id;
              const currentDayNum = selectedDayToAdd[landmark.id] || 1;
              const isAdded = addedNotifications[landmark.id];
              const isLmdSelected = selectedLandmarkId === landmark.id;

              return (
                <div
                  key={landmark.id}
                  onClick={() => setSelectedLandmarkId(landmark.id)}
                  className={`group border rounded-2xl overflow-hidden bg-white shadow-3xs cursor-pointer transition-all duration-300 ${
                    isLmdSelected 
                      ? 'border-orange-500 ring-4 ring-orange-50/70 shadow-md' 
                      : 'border-gray-150/90 hover:border-rose-100 hover:shadow-xs'
                  }`}
                >
                  <div className={`h-2.5 bg-linear-to-r ${
                    landmark.category === 'food' ? 'from-orange-400 to-amber-400' :
                    landmark.category === 'shopping' ? 'from-purple-400 to-pink-400' :
                    'from-rose-400 to-orange-400'
                  }`}></div>

                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[9px] uppercase font-bold tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                          {landmark.category === 'food' ? 'Food & Taste' : landmark.category === 'shopping' ? 'Shopping' : 'Must Visit'}
                        </span>
                        <h3 className="text-base font-bold text-gray-950 mt-1.5 flex items-baseline gap-1.5">
                          {landmark.name}
                          {landmark.nameJa && (
                            <span className="text-xs text-gray-400 font-normal">{landmark.nameJa}</span>
                          )}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-lg shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                        <span>{landmark.rating}</span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-xs md:text-sm line-clamp-2 leading-relaxed">
                      {landmark.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-500 font-medium bg-gray-50/50 p-2 rounded-lg">
                      <div className="flex items-center gap-1">
                        <Train className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{landmark.nearestStation}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{landmark.duration}</span>
                      </div>
                      <div className="flex items-center gap-1 col-span-2 text-gray-600">
                        <Pocket className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>이용료: <strong className="font-bold text-gray-800">{landmark.cost === 0 ? '무료' : `¥${landmark.cost.toLocaleString()}`}</strong></span>
                      </div>
                    </div>

                    {/* Expandable Tips Panel */}
                    {isExpanded && (
                      <div className="pt-2 border-t border-dashed border-gray-200 space-y-1.5 text-xs animate-fadeIn">
                        <h4 className="font-bold text-orange-850">💡 가이드 추천 꿀팁:</h4>
                        <ul className="list-disc pl-4 space-y-1 text-gray-650">
                          {landmark.tips?.map((tip, index) => (
                            <li key={index}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Action Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedId(isExpanded ? null : landmark.id);
                          }}
                          className="text-xs text-stone-500 hover:text-stone-850 underline font-semibold transition"
                        >
                          {isExpanded ? '닫기' : '팁 보기'}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            focusOnMapAndLandmark(landmark);
                          }}
                          className="text-xs text-sky-600 hover:text-sky-850 font-bold flex items-center gap-0.5 transition"
                        >
                          <Compass className="w-3.5 h-3.5" />
                          <span>위치 찾기</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center bg-gray-100 rounded p-0.5">
                          <select
                            value={currentDayNum}
                            onChange={(e) => handleDaySelect(landmark.id, Number(e.target.value))}
                            className="text-xs font-bold text-gray-700 bg-transparent pr-1 pl-1 py-0.5 focus:outline-none border-none cursor-pointer"
                            title="Select Target Day"
                          >
                            {Array.from({ length: Math.max(days, 1) }).map((_, i) => (
                              <option key={i + 1} value={i + 1}>
                                Day {i + 1}
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          onClick={() => triggerAdd(landmark, currentDayNum)}
                          disabled={isAdded}
                          className={`px-2.5 py-1 rounded text-xs font-bold transition-all duration-200 flex items-center gap-0.5 cursor-pointer ${
                            isAdded
                              ? 'bg-emerald-500 text-white'
                              : 'bg-rose-500 text-white hover:bg-rose-600 hover:scale-105'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>추가완료</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>추가</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right side: Interactive Google Map panel */}
        <div
          id="osaka-google-map"
          className={`shrink-0 w-full lg:w-[420px] xl:w-[480px] ${
            viewMode === 'list' ? 'hidden' : 'block'
          }`}
        >
          <div className="sticky top-6 space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-500 font-bold px-1">
              <span className="flex items-center gap-1">
                <MapIcon className="w-3.5 h-3.5 text-orange-500" />
                인터랙티브 로컬 맵
              </span>
              <span>필터링된 마커: {filteredLandmarks.length}개</span>
            </div>
            
            <OsakaMap
              landmarks={filteredLandmarks}
              selectedLandmarkId={selectedLandmarkId}
              onSelectLandmark={setSelectedLandmarkId}
              onAddLandmarkToItinerary={(landmark, targetDay) => {
                triggerAdd(landmark, targetDay || 1);
              }}
              days={days}
            />

            {selectedLandmarkId && (
              <div className="p-3 bg-orange-50/50 border border-orange-100 rounded-xl flex items-center justify-between gap-1 text-xs">
                <div className="font-bold text-orange-800">
                  📍 선택한 매장: {OSAKA_LANDMARKS.find(l => l.id === selectedLandmarkId)?.name}
                </div>
                <button
                  onClick={() => setSelectedLandmarkId(null)}
                  className="text-[10px] text-gray-500 hover:text-gray-900 bg-white border border-gray-200 px-2 py-0.5 rounded transition"
                >
                  선택 취소
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
