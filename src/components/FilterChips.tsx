import React from 'react';
import { CATEGORIES, CONTINENTS } from '../data/destinations';
import { BudgetTier, Continent, DestinationCategory } from '../types';

interface CategoryFilterProps {
  selected: DestinationCategory | 'All';
  onSelect: (category: DestinationCategory | 'All') => void;
}

export function CategoryFilterBar({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div
      className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1"
      role="group"
      aria-label="Filter by travel category"
    >
      <button
        type="button"
        onClick={() => onSelect('All')}
        className={`min-h-[40px] px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
          selected === 'All'
            ? 'bg-[#172B3A] text-white'
            : 'bg-white text-[#172B3A]/75 border border-[#172B3A]/12 hover:border-[#172B3A]/30'
        }`}
      >
        All Categories
      </button>
      {CATEGORIES.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onSelect(category)}
          className={`min-h-[40px] px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
            selected === category
              ? 'bg-[#FF7043] text-white shadow-xs'
              : 'bg-white text-[#172B3A]/75 border border-[#172B3A]/12 hover:border-[#172B3A]/30'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

interface ContinentFilterProps {
  selected: Continent | 'All';
  onSelect: (continent: Continent | 'All') => void;
}

export function ContinentFilterBar({ selected, onSelect }: ContinentFilterProps) {
  return (
    <div
      className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1"
      role="group"
      aria-label="Explore by continent"
    >
      {CONTINENTS.map((cont) => (
        <button
          key={cont.id}
          type="button"
          onClick={() => onSelect(cont.id)}
          className={`min-h-[40px] px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
            selected === cont.id
              ? 'bg-[#006A64] text-white shadow-xs'
              : 'bg-white text-[#172B3A]/75 border border-[#172B3A]/12 hover:border-[#006A64]/40'
          }`}
        >
          {cont.label}
        </button>
      ))}
    </div>
  );
}

interface BudgetFilterProps {
  selected: BudgetTier;
  onSelect: (tier: BudgetTier) => void;
}

const BUDGET_OPTIONS: { id: BudgetTier; label: string }[] = [
  { id: 'all', label: 'Any Budget' },
  { id: 'budget', label: 'Under $110/day' },
  { id: 'mid', label: '$110 – $220/day' },
  { id: 'luxury', label: '$220+/day' },
];

export function BudgetFilterBar({ selected, onSelect }: BudgetFilterProps) {
  return (
    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#172B3A]/5 overflow-x-auto no-scrollbar">
      {BUDGET_OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onSelect(opt.id)}
          className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
            selected === opt.id
              ? 'bg-white text-[#172B3A] shadow-xs'
              : 'text-[#172B3A]/65 hover:text-[#172B3A]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
