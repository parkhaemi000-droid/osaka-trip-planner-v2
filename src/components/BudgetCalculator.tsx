import React, { useState } from 'react';
import { CreditCard, Wallet, Percent, ArrowUpDown, HelpCircle } from 'lucide-react';
import { ItineraryItem, ActivityCategory } from '../types';

interface BudgetCalculatorProps {
  items: ItineraryItem[];
  jpyToKrwRate: number;
}

export default function BudgetCalculator({ items, jpyToKrwRate }: BudgetCalculatorProps) {
  const [calculatorJpy, setCalculatorJpy] = useState<string>('');
  const [calculatorKrw, setCalculatorKrw] = useState<string>('');

  const handleJpyChange = (val: string) => {
    setCalculatorJpy(val);
    if (!val || isNaN(Number(val))) {
      setCalculatorKrw('');
    } else {
      setCalculatorKrw(Math.round(Number(val) * (jpyToKrwRate / 100)).toString());
    }
  };

  const handleKrwChange = (val: string) => {
    setCalculatorKrw(val);
    if (!val || isNaN(Number(val))) {
      setCalculatorJpy('');
    } else {
      setCalculatorJpy((Math.round((Number(val) / jpyToKrwRate) * 100 * 10) / 10).toString());
    }
  };

  // Aggregated Cost Calculation
  const totalJpy = items.reduce((sum, item) => sum + (item.cost || 0), 0);
  const totalKrw = Math.round(totalJpy * (jpyToKrwRate / 100));

  // Category based calculations
  const categoryTotals: Record<ActivityCategory, number> = {
    food: 0,
    sightseeing: 0,
    shopping: 0,
    transport: 0,
    etc: 0
  };

  items.forEach((item) => {
    const cat = item.category || 'etc';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + (item.cost || 0);
  });

  const categories: { key: ActivityCategory; label: string; color: string; barColor: string }[] = [
    { key: 'food', label: '식도락 & 미식 🍣', color: 'text-orange-600', barColor: 'bg-orange-500' },
    { key: 'sightseeing', label: '명소 & 관광 🏯', color: 'text-rose-600', barColor: 'bg-rose-500' },
    { key: 'shopping', label: '기념품 & 쇼핑 🛍️', color: 'text-purple-600', barColor: 'bg-purple-500' },
    { key: 'transport', label: '교통 & 환승 🚆', color: 'text-blue-600', barColor: 'bg-blue-500' },
    { key: 'etc', label: '기타 비용 📃', color: 'text-gray-600', barColor: 'bg-gray-400' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Category-wise Budget Analysis */}
      <div className="bg-white rounded-2xl border border-rose-100 p-6 shadow-xs lg:col-span-2">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-1.5 pb-4 border-b border-rose-50 mb-6">
          <span className="inline-block w-2.5 h-6 bg-rose-500 rounded-sm"></span>
          카테고리별 경비 분석 (JPY)
        </h2>

        {items.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Percent className="w-10 h-10 mx-auto text-gray-350 mb-2" />
            <p className="text-sm font-semibold text-gray-600">일정을 추가하시면 카테고리별 경비 비중이 자동 생성됩니다.</p>
            <p className="text-xs text-gray-400 mt-0.5">상단 탭에서 일정을 추가하거나 AI 자동 일정을 받아보세요!</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-rose-50/20 border border-rose-100 rounded-xl p-4 flex items-center gap-3">
                <Wallet className="w-8 h-8 text-rose-500" />
                <div>
                  <div className="text-xs text-rose-800 font-semibold mb-0.5">총 예상 현지 소요 엔화</div>
                  <div className="text-lg font-black text-gray-900 font-mono">¥{totalJpy.toLocaleString()}</div>
                </div>
              </div>

              <div className="bg-emerald-50/20 border border-emerald-100 rounded-xl p-4 flex items-center gap-3">
                <CreditCard className="w-8 h-8 text-emerald-500" />
                <div>
                  <div className="text-xs text-emerald-850 font-semibold mb-0.5">원화 결제 예상액</div>
                  <div className="text-lg font-black text-gray-900 font-mono">₩{totalKrw.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Progress Meters */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-gray-700">원 그래프 비율 분석</h3>
              {categories.map((cat) => {
                const amount = categoryTotals[cat.key];
                const percentage = totalJpy > 0 ? Math.round((amount / totalJpy) * 100) : 0;

                return (
                  <div key={cat.key} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className={`font-semibold ${cat.color}`}>{cat.label}</span>
                      <span className="font-mono text-gray-500 font-bold">
                        ¥{amount.toLocaleString()} ({percentage}%)
                      </span>
                    </div>

                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${cat.barColor}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. Interactive JPY/KRW Converter Calculator */}
      <div className="bg-white rounded-2xl border border-rose-100 p-6 shadow-xs h-full">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-1.5 pb-4 border-b border-rose-50 mb-6">
          <span className="inline-block w-2.5 h-6 bg-emerald-500 rounded-sm"></span>
          간편 환율 계산기
        </h2>

        <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-500 flex items-start gap-1.5 mb-5 md:text-sm">
          <HelpCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <p className="leading-snug">
            실시간 지출 대비 가이드라인 가격율:<br />
            <strong className="text-gray-800">100 엔(JPY) = {jpyToKrwRate} 원(KRW)</strong> 대입 중
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-600">엔화 (JPY)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">¥</span>
              <input
                type="number"
                min="0"
                placeholder="엔화 입력"
                value={calculatorJpy}
                onChange={(e) => handleJpyChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 pl-8 pr-4 py-2 text-sm focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-200 text-gray-800 bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-center p-1 text-gray-400">
            <ArrowUpDown className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-600">원화 (KRW)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">₩</span>
              <input
                type="number"
                min="0"
                placeholder="한화 입력"
                value={calculatorKrw}
                onChange={(e) => handleKrwChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 pl-8 pr-4 py-2 text-sm focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-200 text-gray-800"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-4 text-[11px] text-gray-400 leading-relaxed text-center">
          * 여행 가계부를 편리하게 관리하고 쇼핑 비용 계산 시 돼지코 장치 및 어댑터를 유용하게 점검해 보세요.
        </div>
      </div>
    </div>
  );
}
