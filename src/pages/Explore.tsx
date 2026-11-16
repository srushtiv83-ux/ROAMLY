import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Compass,
  LayoutGrid,
  Map as MapIcon,
  Plane,
  RotateCcw,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { BudgetTier, Continent, DestinationCategory } from '../types';
import { CONTINENTS } from '../data/destinations';
import { destinationService } from '../services/destinationService';
import { SearchBar } from '../components/SearchBar';
import { BudgetFilterBar, CategoryFilterBar } from '../components/FilterChips';
import { DestinationCard } from '../components/DestinationCard';
import { WorldMapView } from '../components/WorldMapView';

export function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [continent, setContinent] = useState<Continent | 'All'>(
    (searchParams.get('continent') as Continent) || 'All',
  );
  const [category, setCategory] = useState<DestinationCategory | 'All'>('All');
  const [budgetTier, setBudgetTier] = useState<BudgetTier>('all');
  const [soloFriendlyOnly, setSoloFriendlyOnly] = useState(false);
  const [directFlightOnly, setDirectFlightOnly] = useState(false);
  const [hiddenGemsOnly, setHiddenGemsOnly] = useState(
    searchParams.get('hidden') === 'true',
  );
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  useEffect(() => {
    const qParam = searchParams.get('q');
    const cParam = searchParams.get('continent') as Continent | null;
    const hParam = searchParams.get('hidden');
    if (qParam !== null) setQuery(qParam);
    if (cParam) setContinent(cParam);
    if (hParam === 'true') setHiddenGemsOnly(true);
  }, [searchParams]);

  const filteredDestinations = useMemo(
    () =>
      destinationService.filter({
        query,
        continent,
        category,
        budgetTier,
        soloFriendlyOnly,
        directFlightOnly,
        hiddenGemsOnly,
      }),
    [query, continent, category, budgetTier, soloFriendlyOnly, directFlightOnly, hiddenGemsOnly],
  );

  const hiddenGemsSpotlight = useMemo(
    () => destinationService.getHiddenGems().slice(0, 4),
    [],
  );

  const hasActiveFilters =
    Boolean(query.trim()) ||
    continent !== 'All' ||
    category !== 'All' ||
    budgetTier !== 'all' ||
    soloFriendlyOnly ||
    directFlightOnly ||
    hiddenGemsOnly;

  const resetAllFilters = () => {
    setQuery('');
    setContinent('All');
    setCategory('All');
    setBudgetTier('all');
    setSoloFriendlyOnly(false);
    setDirectFlightOnly(false);
    setHiddenGemsOnly(false);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:pb-14 space-y-7">
      {/* Header + View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#172B3A] tracking-tight">
            Explore Worldwide
          </h1>
          <p className="mt-1 text-sm text-[#172B3A]/70">
            Filter {destinationService.getAll().length} curated destinations across all seven continents.
          </p>
        </div>

        {/* List / Map Toggle */}
        <div
          role="group"
          aria-label="Toggle results layout"
          className="inline-flex items-center p-1 rounded-xl bg-[#172B3A]/8 self-start sm:self-auto"
        >
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`min-h-[40px] px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white text-[#172B3A] shadow-xs'
                : 'text-[#172B3A]/65 hover:text-[#172B3A]'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>List View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`min-h-[40px] px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'map'
                ? 'bg-white text-[#172B3A] shadow-xs'
                : 'text-[#172B3A]/65 hover:text-[#172B3A]'
            }`}
          >
            <MapIcon className="w-4 h-4" />
            <span>Map View</span>
          </button>
        </div>
      </div>

      {/* Search & Multi-Facet Filters */}
      <section className="bg-white rounded-3xl border border-[#172B3A]/10 p-4 sm:p-5 space-y-4 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          <div className="lg:col-span-5">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Search countries, cities, landmarks..."
            />
          </div>

          <div className="lg:col-span-3">
            <label htmlFor="explore-continent" className="sr-only">
              Continent filter
            </label>
            <select
              id="explore-continent"
              value={continent}
              onChange={(e) => setContinent(e.target.value as Continent | 'All')}
              className="w-full h-12 px-3.5 rounded-2xl bg-[#FCF9F3] border border-[#172B3A]/12 text-sm font-medium text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#FF7043]"
            >
              {CONTINENTS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-4">
            <BudgetFilterBar selected={budgetTier} onSelect={setBudgetTier} />
          </div>
        </div>

        <CategoryFilterBar selected={category} onSelect={setCategory} />

        {/* Travel Attribute Toggles + Results Count */}
        <div className="pt-2 border-t border-[#172B3A]/8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSoloFriendlyOnly((v) => !v)}
              aria-pressed={soloFriendlyOnly}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 border transition-colors cursor-pointer ${
                soloFriendlyOnly
                  ? 'bg-[#006A64] text-white border-[#006A64]'
                  : 'bg-[#FCF9F3] text-[#172B3A]/80 border-[#172B3A]/12 hover:border-[#172B3A]/30'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Solo-Friendly</span>
            </button>

            <button
              type="button"
              onClick={() => setDirectFlightOnly((v) => !v)}
              aria-pressed={directFlightOnly}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 border transition-colors cursor-pointer ${
                directFlightOnly
                  ? 'bg-[#006A64] text-white border-[#006A64]'
                  : 'bg-[#FCF9F3] text-[#172B3A]/80 border-[#172B3A]/12 hover:border-[#172B3A]/30'
              }`}
            >
              <Plane className="w-3.5 h-3.5" />
              <span>Direct-Flight Hubs</span>
            </button>

            <button
              type="button"
              onClick={() => setHiddenGemsOnly((v) => !v)}
              aria-pressed={hiddenGemsOnly}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 border transition-colors cursor-pointer ${
                hiddenGemsOnly
                  ? 'bg-[#FF7043] text-white border-[#FF7043]'
                  : 'bg-[#FCF9F3] text-[#172B3A]/80 border-[#172B3A]/12 hover:border-[#172B3A]/30'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hidden Gems</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#172B3A]/70 tabular-nums">
            <span>
              Showing <strong className="text-[#172B3A]">{filteredDestinations.length}</strong>{' '}
              {filteredDestinations.length === 1 ? 'destination' : 'destinations'}
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="min-h-[36px] px-3 py-1 rounded-lg text-xs font-semibold text-[#FF7043] hover:bg-[#FF7043]/10 inline-flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Results Area */}
      {filteredDestinations.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#172B3A]/10 p-10 text-center space-y-3">
          <Compass className="w-10 h-10 text-[#FF7043] mx-auto" />
          <h2 className="font-display text-2xl font-bold text-[#172B3A]">
            No destinations match those filters
          </h2>
          <p className="text-sm text-[#172B3A]/70 max-w-md mx-auto">
            Try clearing one of your budget, continent, or solo-friendly filters to uncover more places around the world.
          </p>
          <button
            type="button"
            onClick={resetAllFilters}
            className="min-h-[44px] px-6 py-2.5 rounded-full bg-[#172B3A] text-white text-sm font-semibold hover:bg-[#080C10] transition-colors cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'map' ? (
        <WorldMapView destinations={filteredDestinations} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map((dest) => (
            <DestinationCard key={dest.id} destination={dest} />
          ))}
        </div>
      )}

      {/* Hidden Gems Editorial Shelf (when browsing unfiltered) */}
      {!hiddenGemsOnly && (
        <section className="pt-6 border-t border-[#172B3A]/10 space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#172B3A]">
                Curated Hidden Gems
              </h2>
              <p className="text-sm text-[#172B3A]/65">
                Lesser-known valleys, islands, and polar bays worth the extra journey.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setHiddenGemsOnly(true)}
              className="text-sm font-semibold text-[#FF7043] hover:underline cursor-pointer"
            >
              Filter to all hidden gems →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {hiddenGemsSpotlight.map((dest) => (
              <DestinationCard key={dest.id} destination={dest} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
