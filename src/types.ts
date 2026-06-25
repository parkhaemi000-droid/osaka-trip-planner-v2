export type ActivityCategory = 'food' | 'sightseeing' | 'shopping' | 'transport' | 'etc';

export interface ItineraryItem {
  id: string;
  time: string;
  title: string;
  location: string;
  cost: number; // in KRW or JPY (we can support JPY with automated currency converter approximation)
  notes?: string;
  category: ActivityCategory;
  day: number;
}

export type CompanionType = 'solo' | 'family' | 'couple' | 'friends';
export type InterestType = 'food' | 'culture' | 'shopping' | 'adventure' | 'relaxation';

export interface AIPlanningPreferences {
  days: number;
  companion: CompanionType;
  interest: InterestType;
  customRequirements?: string;
}

export interface Landmark {
  id: string;
  name: string;
  nameJa?: string;
  category: ActivityCategory;
  description: string;
  imageTheme: string;
  cost: number; // JPY
  duration: string;
  nearestStation: string;
  rating: number;
  lat?: number;
  lng?: number;
  tips?: string[];
}

export interface ChecklistItem {
  id: string;
  task: string;
  category: 'essential' | 'clothing' | 'electronics' | 'etc';
  completed: boolean;
}

export interface BudgetSummary {
  category: ActivityCategory;
  amount: number;
}
