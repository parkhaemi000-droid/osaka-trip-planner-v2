import React, { useState } from 'react';
import { 
  Plus, Trash2, Clock, MapPin, AlignLeft, CreditCard, 
  Utensils, Compass, ShoppingBag, Train, FileText, ChevronRight,
  Sparkles, RefreshCw
} from 'lucide-react';
import { ItineraryItem, ActivityCategory } from '../types';

interface ItineraryPlannerProps {
  items: ItineraryItem[];
  days: number;
  jpyToKrwRate: number;
  onAddItem: (item: Omit<ItineraryItem, 'id'>) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
  onUpdateItinerary: (items: ItineraryItem[]) => void;
}

export default function ItineraryPlanner({
  items,
  days,
  jpyToKrwRate,
  onAddItem,
  onDeleteItem,
  onClearAll,
  onUpdateItinerary
}: ItineraryPlannerProps) {
  const [activeDay, setActiveDay] = useState<number>(1);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);

  // Form State
  const [time, setTime] = useState<string>('10:00');
  const [title, setTitle] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [cost, setCost] = useState<string>('');
  const [category, setCategory] = useState<ActivityCategory>('sightseeing');
  const [notes, setNotes] = useState<string>('');

  const activeDayItems = items
    .filter((item) => item.day === activeDay)
    .sort((a, b) => a.time.localeCompare(b.time));

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    onAddItem({
      day: activeDay,
      time,
      title,
      location,
      cost: Number(cost) || 0,
      category,
      notes: notes || undefined
    });

    // Reset Form
    setTitle('');
    setLocation('');
    setCost('');
    setNotes('');
    setShowAddForm(false);
  };

  const handleOptimizeRoute = async () => {
    if (items.length === 0) {
      alert('최적화할 일정이 없습니다. 일정을 먼저 등록해주세요!');
      return;
    }

    if (!confirm('AI를 사용해 일정을 분석하고 동선이 꼬이지 않도록 방문 순서 및 시각을 자동 최적화하시겠습니까?\n(기존 일정 순서와 시간이 변경될 수 있습니다.)')) {
      return;
    }

    setIsOptimizing(true);
    try {
      const response = await fetch('/api/optimize-route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || '동선 최적화 서버 통신 오류');
      }

      if (data.itinerary && Array.isArray(data.itinerary)) {
        onUpdateItinerary(data.itinerary);
        alert('✨ 오사카 최적화 동선 배치가 완료되었습니다! 이제 날짜별 타임라인과 지도를 확인해보세요.');
      } else {
        throw new Error('유효하지 않은 응답 형식입니다.');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || '동선 최적화 중 에러가 발생했습니다. AI Studio Secrets에서 GEMINI_API_KEY가 올바르게 등록되어 있는지 확인해주세요.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const getCategoryIcon = (cat: ActivityCategory) => {
    switch (cat) {
      case 'food':
        return <Utensils className="w-4 h-4 text-orange-500" />;
      case 'sightseeing':
        return <Compass className="w-4 h-4 text-rose-500" />;
      case 'shopping':
        return <ShoppingBag className="w-4 h-4 text-purple-500" />;
      case 'transport':
        return <Train className="w-4 h-4 text-blue-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCategoryTheme = (cat: ActivityCategory) => {
    switch (cat) {
      case 'food':
        return 'bg-orange-50 border-orange-100 text-orange-700';
      case 'sightseeing':
        return 'bg-rose-50 border-rose-100 text-rose-700';
      case 'shopping':
        return 'bg-purple-50 border-purple-100 text-purple-700';
      case 'transport':
        return 'bg-blue-50 border-blue-100 text-blue-700';
      default:
        return 'bg-gray-50 border-gray-100 text-gray-700';
    }
  };

  const getCategoryName = (cat: ActivityCategory) => {
    switch (cat) {
      case 'food': return '맛집';
      case 'sightseeing': return '관광';
      case 'shopping': return '쇼핑';
      case 'transport': return '교통';
      default: return '기타';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-rose-100 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-rose-50">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-6 bg-rose-500 rounded-sm"></span>
            일정 타임라인 관리
          </h2>
          <p className="text-gray-500 text-xs md:text-sm mt-0.5">
            오사카에서의 동선을 분과 시간 단위로 시각화하여 체크할 수 있습니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <button
              onClick={handleOptimizeRoute}
              disabled={isOptimizing}
              className="text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 px-3.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-xs hover:shadow-sm"
            >
              {isOptimizing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>동선 분석 중...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  <span>AI 동선 최적화 ✨</span>
                </>
              )}
            </button>
          )}

          {items.length > 0 && (
            <button
              onClick={() => {
                if (confirm('정말로 작성된 모든 일정을 초기화하시겠습니까?')) {
                  onClearAll();
                }
              }}
              className="text-xs font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer"
            >
              전체 비우기
            </button>
          )}
        </div>
      </div>

      {/* Days tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {Array.from({ length: Math.max(days, 1) }).map((_, idx) => {
          const d = idx + 1;
          const dayItemsCount = items.filter((item) => item.day === d).length;

          return (
            <button
              key={d}
              onClick={() => {
                setActiveDay(d);
                setShowAddForm(false);
              }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                activeDay === d
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-200 scale-105'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              <span>Day {d}</span>
              {dayItemsCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  activeDay === d ? 'bg-white text-rose-600' : 'bg-rose-200 text-rose-800'
                }`}>
                  {dayItemsCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Day Content */}
      <div className="space-y-6">
        {/* Toggle add item form */}
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full border-2 border-dashed border-rose-200 hover:border-rose-400 text-rose-600 font-semibold text-sm py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer hover:bg-rose-50/30"
          >
            <Plus className="w-4 h-4" />
            <span>Day {activeDay}에 새로운 일정 추가하기</span>
          </button>
        ) : (
          <form style={{ contentVisibility: 'auto' }} onSubmit={handleFormSubmit} className="bg-rose-50/20 border border-rose-100 rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-gray-800">새로운 일정 추가 (Day {activeDay})</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">방문 시각 *</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-200 text-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">일정 제목 *</label>
                <input
                  type="text"
                  required
                  placeholder="예: 다루마 쿠시카츠 저녁식사"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-200 text-gray-800 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">장소/위치</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="예: 오사카 신세카이"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-200 text-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">예상 비용 (엔화 JPY)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">¥</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="예: 1500 (입장료/식사지출)"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 pl-8 pr-4 py-2 text-sm focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-200 text-gray-800 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">구분 카테고리</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ActivityCategory)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-200 text-gray-800 bg-white"
                >
                  <option value="sightseeing">관광 🏯</option>
                  <option value="food">식도락/맛집 🍣</option>
                  <option value="shopping">쇼핑 🛍️</option>
                  <option value="transport">교통/이동 🚆</option>
                  <option value="etc">기타활동 📃</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">메모/팁</label>
                <div className="relative">
                  <AlignLeft className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="예: 오사카 주유패스 무료 혜택!"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-200 text-gray-800"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-rose-100">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-lg shadow-sm cursor-pointer"
              >
                일정으로 추가
              </button>
            </div>
          </form>
        )}

        {/* Timeline representation */}
        {activeDayItems.length === 0 ? (
          <div className="text-center py-12 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400">
            <Clock className="w-10 h-10 mx-auto text-gray-300 mb-3" />
            <p className="text-sm font-semibold text-gray-600">Day {activeDay} 일정이 아직 비어 있습니다.</p>
            <p className="text-xs text-gray-400 mt-1">상단의 AI 비서를 이용하거나 새로 추가 버튼을 통해 채워보세요!</p>
          </div>
        ) : (
          <div className="relative border-l border-rose-100 ml-4 pl-4 space-y-6">
            {activeDayItems.map((item) => {
              const costKrw = Math.round(item.cost * (jpyToKrwRate / 100));

              return (
                <div key={item.id} className="relative group transition-all duration-200">
                  {/* Timeline Indicator Node */}
                  <span className="absolute -left-[25px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white ring-4 ring-rose-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                  </span>

                  <div className="bg-white hover:bg-rose-50/10 border border-gray-100 hover:border-rose-200 rounded-xl p-4 shadow-3xs transition-all duration-200">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold font-mono text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.time}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold border rounded-md uppercase tracking-wider ${getCategoryTheme(item.category)}`}>
                            {getCategoryIcon(item.category)}
                            {getCategoryName(item.category)}
                          </span>
                        </div>

                        <h3 className="font-bold text-gray-950 text-sm md:text-base pt-1">
                          {item.title}
                        </h3>

                        {item.location && (
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            <span>{item.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Delete itinerary item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Cost conversion drawer */}
                    {item.cost > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-mono">
                        <span className="flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                          예상 현지 지출액
                        </span>
                        <span>
                          <strong className="text-gray-900 font-bold">¥{item.cost.toLocaleString()}</strong>
                          <span className="mx-1.5 text-gray-350">≈</span>
                          <strong className="text-emerald-600 font-bold">₩{costKrw.toLocaleString()}</strong>
                        </span>
                      </div>
                    )}

                    {/* Notes block */}
                    {item.notes && (
                      <div className="mt-2 text-xs bg-gray-50 border-l-2 border-gray-300 p-2 text-gray-600 rounded-r-md italic leading-relaxed">
                        💡 {item.notes}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
