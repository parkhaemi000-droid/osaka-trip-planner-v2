import React, { useState } from 'react';
import { ChecklistItem } from '../types';
import { CheckSquare, Square, Plus, Trash2, Tag, Percent } from 'lucide-react';

interface PackingChecklistProps {
  items: ChecklistItem[];
  onToggleItem: (id: string) => void;
  onAddItem: (task: string, category: ChecklistItem['category']) => void;
  onDeleteItem: (id: string) => void;
  onResetToDefaults: () => void;
}

export default function PackingChecklist({
  items,
  onToggleItem,
  onAddItem,
  onDeleteItem,
  onResetToDefaults
}: PackingChecklistProps) {
  const [newTask, setNewTask] = useState<string>('');
  const [newCategory, setNewCategory] = useState<ChecklistItem['category']>('essential');

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    onAddItem(newTask.trim(), newCategory);
    setNewTask('');
  };

  const completedCount = items.filter((item) => item.completed).length;
  const totalCount = items.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const getCategoryTheme = (cat: ChecklistItem['category']) => {
    switch (cat) {
      case 'essential':
        return 'bg-red-50 text-red-700 border-red-100';
      case 'clothing':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'electronics':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const getCategoryLabel = (cat: ChecklistItem['category']) => {
    switch (cat) {
      case 'essential': return '필수품 🚨';
      case 'clothing': return '의류/뷰티 👕';
      case 'electronics': return '전자기기 🔌';
      default: return '기타 📦';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-rose-100 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-rose-50">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-6 bg-rose-500 rounded-sm"></span>
            오사카 준비물 체크리스트
          </h2>
          <p className="text-gray-500 text-xs md:text-sm mt-0.5">
            오사카 출입국 및 현지 여행에 차질이 없도록 가방 속 물건들을 꼼꼼하게 검수해 보세요.
          </p>
        </div>

        <button
          onClick={onResetToDefaults}
          className="text-xs font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer self-start sm:self-auto"
        >
          기본 사전 준비물로 리셋
        </button>
      </div>

      {/* Progress metrics */}
      <div className="bg-rose-50/10 border border-rose-100/50 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between text-sm font-semibold mb-2">
          <span className="text-gray-800 flex items-center gap-1.5">
            <Percent className="w-4 h-4 text-rose-500" />
            패킹 준비 진행도
          </span>
          <span className="text-rose-600">
            {completedCount}개 완료 / 총 {totalCount}개 중 ({completionPercentage}%)
          </span>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-3.5 overflow-hidden">
          <div
            className="h-full rounded-full bg-rose-500 transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Quick Add Custom Item */}
      <form onSubmit={handleAddNewItem} className="bg-gray-15/30 border border-gray-100 rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-3 items-center">
        <div className="w-full md:flex-1">
          <input
            type="text"
            required
            placeholder="예: 돼지코 어댑터, 편의점 동전 가방, 주유패스 실물권"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-200 text-gray-800 bg-white"
          />
        </div>

        <div className="w-full md:w-auto shrink-0">
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as ChecklistItem['category'])}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-200 text-gray-800 bg-white font-medium"
            title="Category"
          >
            <option value="essential">필수품 🚨</option>
            <option value="clothing">의류 👕</option>
            <option value="electronics">기기 🔌</option>
            <option value="etc">기타 📦</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full md:w-auto bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold px-5 py-2.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          추가
        </button>
      </form>

      {/* Checklist list representation */}
      {items.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          체크리스트가 없습니다. 준비물을 새로 기입해 보세요!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3" style={{ contentVisibility: 'auto' }}>
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => onToggleItem(item.id)}
              className={`p-3.5 border rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all duration-250 hover:bg-rose-50/5 select-none ${
                item.completed
                  ? 'border-gray-200 bg-gray-50/50 opacity-70'
                  : 'border-rose-100 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <button type="button" className="text-rose-500 shrink-0">
                  {item.completed ? (
                    <CheckSquare className="w-5 h-5 fill-rose-100" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-300" />
                  )}
                </button>

                <div>
                  <span className={`text-sm font-semibold block ${item.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {item.task}
                  </span>
                  <span className={`inline-block text-[9px] px-1.5 py-0.5 mt-1 rounded font-bold uppercase tracking-wider ${getCategoryTheme(item.category)}`}>
                    {getCategoryLabel(item.category)}
                  </span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation(); // Avoid triggering toggle completion
                  onDeleteItem(item.id);
                }}
                className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Delete packing item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
