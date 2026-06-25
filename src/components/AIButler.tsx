import React, { useState } from 'react';
import { Sparkles, Calendar, Users, HelpCircle, Footprints, AlertCircle, RefreshCw } from 'lucide-react';
import { CompanionType, InterestType, ItineraryItem } from '../types';

interface AIButlerProps {
  onImportGenerated: (items: ItineraryItem[]) => void;
  activeId: string;
}

export default function AIButler({ onImportGenerated }: AIButlerProps) {
  const [days, setDays] = useState<number>(3);
  const [companion, setCompanion] = useState<CompanionType>('solo');
  const [interest, setInterest] = useState<InterestType>('food');
  const [customRequirements, setCustomRequirements] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          days,
          companion,
          interest,
          customRequirements: customRequirements.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '일정을 생성하는 과정에서 서버 에러가 발생했습니다.');
      }

      if (data.itinerary && Array.isArray(data.itinerary)) {
        // Add random IDs to each generated item to prevent duplicates
        const formattedItems = data.itinerary.map((item: any, idx: number) => ({
          ...item,
          id: `ai-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
          cost: Number(item.cost) || 0
        }));

        onImportGenerated(formattedItems);
        
        // Custom requirements reset or notification
        alert(`성공적으로 ${days}일간의 맞춤 오사카 일정이 자동 생성되었습니다!`);
      } else {
        throw new Error('올바르지 않은 일정 형식입니다. 다시 일정을 생성해 주세요.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || '네트워크 통신 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const companionOptions: { value: CompanionType; label: string; desc: string }[] = [
    { value: 'solo', label: '나 홀로 여행 🎒', desc: '내 페이스 대로 자유롭고 감성 넘치게' },
    { value: 'couple', label: '연인과 함께 💕', desc: '낭만적인 전망대와 트렌디한 카페 코스' },
    { value: 'family', label: '가족과 함께 👨‍👩‍👧‍👦', desc: '대중교통을 줄이고 편안하고 안락하게' },
    { value: 'friends', label: '친구들과 함께 🍻', desc: '이색 밤거리 투어 및 활기찬 맛집 탐방' },
  ];

  const interestOptions: { value: InterestType; label: string; desc: string; color: string }[] = [
    { value: 'food', label: '식도락 탐방 🍣', desc: '타코야끼부터 미슐랭 식당까지 정복하기', color: 'border-orange-200 hover:border-orange-400 bg-orange-50/40 text-orange-700' },
    { value: 'culture', label: '문화/관광 🏯', desc: '오사카성, 신사 등 정석 역사 유적 조명', color: 'border-rose-200 hover:border-rose-400 bg-rose-50/40 text-rose-700' },
    { value: 'shopping', label: '대형 쇼핑 🛍️', desc: '드러그스토어, 소품샵, 메이저 백화점 투어', color: 'border-purple-200 hover:border-purple-400 bg-purple-50/40 text-purple-700' },
    { value: 'adventure', label: '테마파크 🎢', desc: '유니버설 스튜디오 완벽 가이드와 익스트림', color: 'border-blue-200 hover:border-blue-400 bg-blue-50/40 text-blue-700' },
    { value: 'relaxation', label: '여유/힐링 🌿', desc: '한적한 골목길, 노천 온천 및 강변 피크닉', color: 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/40 text-emerald-700' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-rose-100 p-6 md:p-8 shadow-xs relative">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-500 animate-pulse" />
            AI 오사카 일정 기획가
          </h2>
          <p className="text-gray-500 text-xs md:text-sm mt-1">
            원하는 테마와 일수를 고르면, 스마트하고 합리적인 코스를 초 단위로 완성해 드립니다.
          </p>
        </div>
        <span className="hidden md:inline-flex px-2.5 py-1 bg-rose-100 text-rose-700 text-xs font-semibold rounded-full tracking-wide">
          Gemini 2.5 Flash
        </span>
      </div>

      <form onSubmit={handleGenerate} className="space-y-6">
        {/* 1. Days Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2.5 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-rose-500" />
            여행 일수 선택
          </label>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                  days === d
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {d}일 동안
              </button>
            ))}
          </div>
        </div>

        {/* 2. Companion Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2.5 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-orange-500" />
            여행 동반자 유형
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {companionOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setCompanion(opt.value)}
                className={`p-3.5 text-left rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                  companion === opt.value
                    ? 'border-orange-500 bg-orange-50/50 text-gray-900'
                    : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                }`}
              >
                <div className="font-semibold text-sm">{opt.label}</div>
                <div className="text-xs text-gray-500 mt-1">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Interest Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2.5 flex items-center gap-1.5">
            <Footprints className="w-4 h-4 text-amber-500" />
            주요 여행 테마
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {interestOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setInterest(opt.value)}
                className={`p-3.5 text-left rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                  interest === opt.value
                    ? 'border-amber-500 ring-2 ring-amber-100 bg-amber-50/30'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold text-sm">{opt.label}</div>
                <div className="text-xs text-gray-500 mt-1 line-clamp-1">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Custom Requirements */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2 bg-white flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-purple-500" />
            AI를 위한 요청 (선택사항)
          </label>
          <textarea
            value={customRequirements}
            onChange={(e) => setCustomRequirements(e.target.value)}
            placeholder="예: '부모님을 모시고 가기 때문에 이동 동선이 편해야 돼요', '유니버설 스튜디오 재팬 마리오 월드 정리권 정보를 꼭 녹여주세요', '오코노미야끼 3대 명가는 꼭 가보고 싶어요'"
            rows={3}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-200 text-gray-800 placeholder:text-gray-400 resize-none"
          />
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 bg-red-50 rounded-xl border border-red-200 text-red-700 text-xs md:text-sm flex gap-2 items-start">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
            <div>
              <p className="font-semibold">에러 안내</p>
              <p className="mt-1">{error}</p>
              <p className="mt-2 text-[11px] text-red-500">
                💡 AI Studio UI 상단의 'Secrets' 메뉴를 사용하여 <code className="bg-red-100 rounded px-1 selection:bg-red-200 font-mono">GEMINI_API_KEY</code>를 등록했는지 확인해보세요.
              </p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-linear-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-rose-200 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-wait"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>오사카 최적 루트 탐색 중 (약 3초 소요)...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
              <span>오사카 맞춤형 웰메이드 일정 피드백 받기</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
