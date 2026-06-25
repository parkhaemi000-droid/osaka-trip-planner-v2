import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Calendar, MapPin, JapaneseYen, CheckSquare, 
  Map, Lightbulb, RefreshCw, Sun, Moon, LogIn, LogOut, User as UserIcon
} from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, googleProvider, signInWithPopup, signOut } from './lib/firebase';
import { ItineraryItem, ChecklistItem, Landmark } from './types';
import { INITIAL_CHECKLIST } from './data';
import Banner from './components/Banner';
import AIButler from './components/AIButler';
import ItineraryPlanner from './components/ItineraryPlanner';
import Hotspots from './components/Hotspots';
import BudgetCalculator from './components/BudgetCalculator';
import PackingChecklist from './components/PackingChecklist';
import SubwayGuide from './components/SubwayGuide';
import Restaurants from './components/Restaurants';
import OsakaWeatherCard from './components/OsakaWeatherCard';

export default function App() {
  // --- States ---
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'planner' | 'ai' | 'hotspots' | 'budget' | 'checklist' | 'subway' | 'restaurants'>('planner');
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [jpyToKrwRate, setJpyToKrwRate] = useState<number>(900); // Default stable fallback
  const [daysCount, setDaysCount] = useState<number>(10); // Default duration 10 days
  const [isRateLoading, setIsRateLoading] = useState<boolean>(false);

  // --- Firebase Auth Subscription & Handlers ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setAuthError(null);
    try {
      setIsAuthLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Google Auth Error:', error);
      setAuthError('구글 로그인 중 에러가 발생했습니다. (팝업 수락 필요)');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    setAuthError(null);
    try {
      setIsAuthLoading(true);
      await signOut(auth);
    } catch (error: any) {
      console.error('Logout Error:', error);
      setAuthError('로그아웃 중 오류가 발생했습니다.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // --- Initial Sync with LocalStorage & Conversion API ---
  useEffect(() => {
    // 1. Load Itinerary
    const savedItinerary = localStorage.getItem('osaka_itinerary');
    if (savedItinerary) {
      try {
        const parsed = JSON.parse(savedItinerary);
        setItinerary(parsed);
        // Find max day to align duration
        if (parsed.length > 0) {
          const maxDay = Math.max(...parsed.map((item: any) => Number(item.day) || 1));
          setDaysCount(Math.max(maxDay, 10));
        }
      } catch (e) {
        console.error('Error parsing itinerary', e);
      }
    }

    // 2. Load Checklist
    const savedChecklist = localStorage.getItem('osaka_checklist');
    if (savedChecklist) {
      try {
        setChecklist(JSON.parse(savedChecklist));
      } catch (e) {
        setChecklist(INITIAL_CHECKLIST);
      }
    } else {
      setChecklist(INITIAL_CHECKLIST);
    }

    // 3. Fetch current JPY/KRW Rate from our proxy server
    fetchRate();
  }, []);

  const fetchRate = async () => {
    setIsRateLoading(true);
    try {
      const response = await fetch('/api/rate');
      if (response.ok) {
        const data = await response.json();
        if (data.rate) {
          setJpyToKrwRate(data.rate);
        }
      }
    } catch (err) {
      console.warn('Could not retrieve live exchange rate. Using stable default rate of 900 KRW for 100 JPY.', err);
    } finally {
      setIsRateLoading(false);
    }
  };

  // --- State persistence helpers ---
  const saveItinerary = (updated: ItineraryItem[]) => {
    setItinerary(updated);
    localStorage.setItem('osaka_itinerary', JSON.stringify(updated));
  };

  const saveChecklist = (updated: ChecklistItem[]) => {
    setChecklist(updated);
    localStorage.setItem('osaka_checklist', JSON.stringify(updated));
  };

  // --- Itinerary Handlers ---
  const handleAddItem = (newItem: Omit<ItineraryItem, 'id'>) => {
    const item: ItineraryItem = {
      ...newItem,
      id: `man-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    };
    const updated = [...itinerary, item];
    saveItinerary(updated);

    // Dynamic adjustment of travel duration if item day is larger
    if (item.day > daysCount) {
      setDaysCount(item.day);
    }
  };

  const handleDeleteItem = (id: string) => {
    const updated = itinerary.filter((item) => item.id !== id);
    saveItinerary(updated);
  };

  const handleClearItinerary = () => {
    saveItinerary([]);
    setDaysCount(10); // reset to default baseline
  };

  const handleImportAICreatedItinerary = (items: ItineraryItem[]) => {
    // Determine number of days in the imported itinerary
    if (items.length > 0) {
      const maxDay = Math.max(...items.map(item => item.day));
      setDaysCount(maxDay);
    }
    saveItinerary(items);
    setActiveTab('planner'); // bring user to timeline to admire it!
  };

  const handleAddLandmarkToItinerary = (landmark: Landmark, targetDay: number) => {
    const item: ItineraryItem = {
      id: `landmark-${Date.now()}-${landmark.id}`,
      day: targetDay,
      time: landmark.category === 'food' ? '12:30' : '10:00', // reasonable defaults
      title: landmark.name,
      location: landmark.nearestStation,
      cost: landmark.cost,
      category: landmark.category,
      notes: landmark.tips && landmark.tips.length > 0 ? landmark.tips[0] : `명소 가이드: ${landmark.description.substring(0, 40)}...`
    };
    saveItinerary([...itinerary, item]);
  };

  // --- Checklist Handlers ---
  const handleToggleChecklistItem = (id: string) => {
    const updated = checklist.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    saveChecklist(updated);
  };

  const handleAddChecklistItem = (task: string, category: ChecklistItem['category']) => {
    const newItem: ChecklistItem = {
      id: `check-${Date.now()}`,
      task,
      category,
      completed: false
    };
    saveChecklist([...checklist, newItem]);
  };

  const handleDeleteChecklistItem = (id: string) => {
    saveChecklist(checklist.filter((item) => item.id !== id));
  };

  const handleResetChecklistToDefaults = () => {
    saveChecklist(INITIAL_CHECKLIST);
  };

  // --- Computations for banner/summary stats ---
  const totalCostJpy = itinerary.reduce((sum, item) => sum + (item.cost || 0), 0);
  const totalCostKrw = Math.round(totalCostJpy * (jpyToKrwRate / 100));

  // --- Tab config ---
  const tabOptions = [
    { id: 'planner' as const, label: '나의 일정정리 🗺️', desc: '타임라인 및 편집' },
    { id: 'ai' as const, label: 'AI 일정비서 💡', desc: '자동 생성 코칭' },
    { id: 'hotspots' as const, label: '인기 명소 🏯', desc: '로컬 상세백과' },
    { id: 'restaurants' as const, label: '구글 맛집 🍣', desc: '실시간 미식 지도' },
    { id: 'subway' as const, label: '지하철 환승 🚇', desc: '노선 및 패스 팁' },
    { id: 'budget' as const, label: '여행 가계부 💳', desc: '비용 분석 & 환율' },
    { id: 'checklist' as const, label: '가방 꾸리기 🎒', desc: '체크리스트 확인' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 text-gray-800 font-sans selection:bg-rose-100 pb-16">
      {/* Decorative Traditional Japanese Eaves/Paper Lantern Floating Border */}
      <div className="bg-linear-to-r from-rose-600 to-orange-500 h-1.5 w-full"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Real-time floating header menu */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl border border-rose-50 shadow-3xs">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-rose-500 text-white rounded-xl shadow-md shadow-rose-100 flex items-center justify-center font-bold">
              大阪
            </span>
            <div>
              <span className="text-xs font-bold text-rose-600 block leading-tight tracking-wider uppercase">OSAKA TRIP ADVISOR</span>
              <span className="text-base font-black text-gray-900">오사카 여행 스마트 도우미</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Live Exchange Rate Status */}
            <div className="bg-emerald-50 text-emerald-800 font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>100 JPY ⇄ ₩{jpyToKrwRate} KRW</span>
              <button 
                onClick={fetchRate} 
                disabled={isRateLoading} 
                className="hover:text-emerald-900 disabled:opacity-50 inline-flex"
                title="Exchange Rate Refresh"
              >
                <RefreshCw className={`w-3 h-3 ml-1 ${isRateLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="bg-slate-100 text-slate-705 font-mono font-medium px-3 py-1.5 rounded-lg">
              UTC {new Date().toUTCString().slice(17, 22)}
            </div>

            {/* Google Authentication Integration */}
            {isAuthLoading ? (
              <div className="bg-slate-100 text-slate-400 font-medium px-3 py-1.5 rounded-lg flex items-center gap-2">
                <RefreshCw className="w-3 h-3 animate-spin text-rose-500" />
                <span>처리 중...</span>
              </div>
            ) : user ? (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 pl-2 pr-3 py-1 rounded-xl shadow-3xs">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'User'} 
                    className="w-6 h-6 rounded-full border border-rose-200"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                    {user.displayName ? user.displayName[0] : <UserIcon className="w-3.5 h-3.5" />}
                  </div>
                )}
                <div className="flex flex-col items-start leading-none max-w-[120px] sm:max-w-[180px]">
                  <span className="font-bold text-gray-800 text-[11px] truncate w-full">
                    {user.displayName || '여행자'}님
                  </span>
                  <span className="text-[9px] text-gray-400 truncate w-full">
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 p-1 rounded-lg transition-all cursor-pointer"
                  title="로그아웃"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleLogin}
                className="bg-white hover:bg-slate-50 text-gray-700 font-extrabold px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-slate-200 transition-all hover:border-slate-300 shadow-3xs cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                <span>구글 로그인</span>
              </button>
            )}
          </div>
        </header>

        {/* Error notice banner */}
        {authError && (
          <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-2xl mb-6 text-xs flex justify-between items-center shadow-3xs">
            <span>⚠️ {authError}</span>
            <button 
              onClick={() => setAuthError(null)} 
              className="text-red-500 hover:text-red-900 font-bold ml-4 cursor-pointer"
            >
              닫기
            </button>
          </div>
        )}

        {/* Banner with Weather Card next to it */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
          <div className="xl:col-span-3">
            <Banner 
              totalDays={daysCount} 
              totalCostJpy={totalCostJpy} 
              totalCostKrw={totalCostKrw} 
            />
          </div>
          <div className="xl:col-span-1">
            <OsakaWeatherCard />
          </div>
        </div>

        {/* Navigation Tabs (Primary Workspace Router) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 mb-8 bg-white/60 p-1.5 rounded-2xl border border-gray-100 shadow-3xs">
          {tabOptions.map((opt) => {
            const isActive = activeTab === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setActiveTab(opt.id)}
                className={`py-3 px-2 rounded-xl text-center select-none cursor-pointer transition-all duration-300 col-span-1 border ${
                  isActive
                    ? 'bg-white text-rose-600 border-rose-100/80 shadow-md shadow-gray-15/20 scale-102 font-bold'
                    : 'bg-transparent text-gray-500 hover:text-gray-900 border-transparent hover:bg-white/40'
                }`}
              >
                <div className="text-sm md:text-base leading-none mb-1.5">{opt.label}</div>
                <div className="text-[10px] font-normal text-gray-400 leading-none truncate">{opt.desc}</div>
              </button>
            );
          })}
        </div>

        {/* Tab workspace rendered dynamically */}
        <main className="space-y-8">
          {activeTab === 'planner' && (
            <ItineraryPlanner 
              items={itinerary}
              days={daysCount}
              jpyToKrwRate={jpyToKrwRate}
              onAddItem={handleAddItem}
              onDeleteItem={handleDeleteItem}
              onClearAll={handleClearItinerary}
              onUpdateItinerary={saveItinerary}
            />
          )}

          {activeTab === 'ai' && (
            <AIButler 
              onImportGenerated={handleImportAICreatedItinerary}
              activeId={activeTab}
            />
          )}

          {activeTab === 'hotspots' && (
            <Hotspots 
              onAddLandmarkToItinerary={handleAddLandmarkToItinerary}
              days={daysCount}
            />
          )}

          {activeTab === 'restaurants' && (
            <Restaurants 
              onAddItem={handleAddItem}
              days={daysCount}
            />
          )}

          {activeTab === 'subway' && (
            <SubwayGuide />
          )}

          {activeTab === 'budget' && (
            <BudgetCalculator 
              items={itinerary}
              jpyToKrwRate={jpyToKrwRate}
            />
          )}

          {activeTab === 'checklist' && (
            <PackingChecklist 
              items={checklist}
              onToggleItem={handleToggleChecklistItem}
              onAddItem={handleAddChecklistItem}
              onDeleteItem={handleDeleteChecklistItem}
              onResetToDefaults={handleResetChecklistToDefaults}
            />
          )}
        </main>
      </div>

      {/* Floating lanterns / traditional background decorations */}
      <footer className="mt-20 border-t border-gray-200 bg-white py-8 text-center text-xs text-gray-400">
        <p className="font-medium">🌳 오사카 일정 플래너 © Osaka Trip Planner 2026</p>
        <p className="mt-1">AI 일정 생성은 Google Gemini 2.5 Flash 엔진으로 구동 중입니다.</p>
      </footer>
    </div>
  );
}
