import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Calendar,
  Compass,
  Minus,
  Moon,
  Plus,
  Save,
  Sun,
  Sunrise,
  Trash2,
  Users,
} from 'lucide-react';
import {
  DestinationCategory,
  ItineraryActivity,
  TimeSlot,
  TripDay,
  TripPace,
  TripPlan,
} from '../types';
import { CATEGORIES } from '../data/destinations';
import { destinationService } from '../services/destinationService';
import { useRoamly } from '../context/RoamlyContext';
import { calculateTripTotalUsd, useTrips } from '../hooks/useTrips';
import { formatCurrency } from '../services/storage';
import { SafeImage } from '../components/SafeImage';

function computeDaysBetween(startStr: string, endStr: string): number {
  const s = new Date(startStr);
  const e = new Date(endStr);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 3;
  const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, Math.min(14, diff));
}

function buildInitialDays(count: number, destId: string): TripDay[] {
  const dest = destinationService.getById(destId);
  return Array.from({ length: count }, (_, idx) => {
    const dayNum = idx + 1;
    const starterActivities: ItineraryActivity[] =
      idx === 0 && dest
        ? dest.activities.slice(0, 2).map((act, i) => ({
            id: `init-${Date.now()}-${i}`,
            timeSlot: act.timeOfDay,
            title: act.title,
            estimatedCostUsd: act.estimatedCost,
            duration: act.duration,
          }))
        : [];
    return {
      dayNumber: dayNum,
      label: idx === 0 && dest ? `Arrival in ${dest.name}` : `Day ${dayNum} Exploration`,
      activities: starterActivities,
    };
  });
}

const SLOT_META: { slot: TimeSlot; icon: typeof Sunrise; label: string }[] = [
  { slot: 'Morning', icon: Sunrise, label: 'Morning' },
  { slot: 'Afternoon', icon: Sun, label: 'Afternoon' },
  { slot: 'Evening', icon: Moon, label: 'Evening' },
];

export function TripPlanner() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { profile, showToast } = useRoamly();
  const { trips, saveTrip, deleteTrip } = useTrips();

  const allDestinations = useMemo(() => destinationService.getAll(), []);

  const tripIdParam = searchParams.get('tripId');
  const destIdParam = searchParams.get('destination');

  const existingTrip = useMemo(
    () => (tripIdParam ? trips.find((t) => t.id === tripIdParam) : undefined),
    [tripIdParam, trips],
  );

  const initialDestId =
    existingTrip?.destinationId ||
    (destIdParam && destinationService.getById(destIdParam)?.id) ||
    allDestinations[0].id;

  const initialDest = destinationService.getById(initialDestId) || allDestinations[0];

  const [editingId, setEditingId] = useState<string | null>(existingTrip?.id || null);
  const [destinationId, setDestinationId] = useState<string>(initialDestId);
  const [title, setTitle] = useState<string>(
    existingTrip?.title || `${initialDest.name} Discovery`,
  );
  const [departureDate, setDepartureDate] = useState<string>(
    existingTrip?.departureDate || '2026-12-10',
  );
  const [returnDate, setReturnDate] = useState<string>(
    existingTrip?.returnDate || '2026-12-13',
  );
  const [travelers, setTravelers] = useState<number>(existingTrip?.travelers || 2);
  const [targetBudgetUsd, setTargetBudgetUsd] = useState<number>(
    existingTrip?.targetBudgetUsd || initialDest.dailyBudgetUsd * 4 * 2,
  );
  const [pace, setPace] = useState<TripPace>(existingTrip?.pace || 'Balanced');
  const [preferences, setPreferences] = useState<DestinationCategory[]>(
    existingTrip?.preferences || [initialDest.category],
  );
  const [accommodationName, setAccommodationName] = useState<string>(
    existingTrip?.accommodationName || initialDest.accommodations[0]?.name || 'Boutique Stay',
  );
  const [accommodationPerNightUsd, setAccommodationPerNightUsd] = useState<number>(
    existingTrip?.accommodationPerNightUsd ||
      initialDest.accommodations[0]?.estimatedPerNight ||
      140,
  );
  const [transportationMode, setTransportationMode] = useState<string>(
    existingTrip?.transportationMode || 'Flights & Local Rail',
  );
  const [transportationCostUsd, setTransportationCostUsd] = useState<number>(
    existingTrip?.transportationCostUsd ?? 380,
  );
  const [days, setDays] = useState<TripDay[]>(
    existingTrip?.days || buildInitialDays(4, initialDestId),
  );
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  // Custom activity form
  const [newSlot, setNewSlot] = useState<TimeSlot>('Morning');
  const [newActivityTitle, setNewActivityTitle] = useState('');
  const [newActivityCost, setNewActivityCost] = useState('25');

  // Re-sync when URL tripId or destination changes
  useEffect(() => {
    if (existingTrip) {
      setEditingId(existingTrip.id);
      setDestinationId(existingTrip.destinationId);
      setTitle(existingTrip.title);
      setDepartureDate(existingTrip.departureDate);
      setReturnDate(existingTrip.returnDate);
      setTravelers(existingTrip.travelers);
      setTargetBudgetUsd(existingTrip.targetBudgetUsd);
      setPace(existingTrip.pace);
      setPreferences(existingTrip.preferences);
      setAccommodationName(existingTrip.accommodationName);
      setAccommodationPerNightUsd(existingTrip.accommodationPerNightUsd);
      setTransportationMode(existingTrip.transportationMode);
      setTransportationCostUsd(existingTrip.transportationCostUsd);
      setDays(existingTrip.days);
      setActiveDayIndex(0);
    } else if (destIdParam) {
      const d = destinationService.getById(destIdParam);
      if (d) {
        setEditingId(null);
        setDestinationId(d.id);
        setTitle(`${d.name} Discovery`);
        setTargetBudgetUsd(d.dailyBudgetUsd * 4 * 2);
        setPreferences([d.category]);
        setAccommodationName(d.accommodations[0]?.name || 'Boutique Stay');
        setAccommodationPerNightUsd(d.accommodations[0]?.estimatedPerNight || 140);
        setDays(buildInitialDays(4, d.id));
        setActiveDayIndex(0);
      }
    }
  }, [existingTrip, destIdParam]);

  const selectedDestination = useMemo(
    () => destinationService.getById(destinationId) || allDestinations[0],
    [destinationId, allDestinations],
  );

  // Synchronize days array when dates change
  const handleDateChange = (nextDep: string, nextRet: string) => {
    let validRet = nextRet;
    if (new Date(nextRet) < new Date(nextDep)) {
      validRet = nextDep;
    }
    setDepartureDate(nextDep);
    setReturnDate(validRet);
    const count = computeDaysBetween(nextDep, validRet);
    setDays((prev) => {
      if (count === prev.length) return prev;
      if (count < prev.length) {
        setActiveDayIndex((curr) => Math.min(curr, count - 1));
        return prev.slice(0, count);
      }
      const extra: TripDay[] = [];
      for (let i = prev.length; i < count; i++) {
        extra.push({
          dayNumber: i + 1,
          label: `Day ${i + 1} Exploration`,
          activities: [],
        });
      }
      return [...prev, ...extra];
    });
  };

  const handleSelectDestination = (nextDestId: string) => {
    setDestinationId(nextDestId);
    const d = destinationService.getById(nextDestId);
    if (d) {
      if (!editingId) {
        setTitle(`${d.name} Discovery`);
      }
      setAccommodationName(d.accommodations[0]?.name || 'Boutique Stay');
      setAccommodationPerNightUsd(d.accommodations[0]?.estimatedPerNight || 140);
      setPreferences([d.category]);
    }
  };

  const togglePref = (cat: DestinationCategory) => {
    setPreferences((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const addActivityToActiveDay = (
    actTitle: string,
    slot: TimeSlot,
    costUsd: number,
    duration = '2 hrs',
  ) => {
    if (!actTitle.trim()) return;
    const item: ItineraryActivity = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timeSlot: slot,
      title: actTitle.trim(),
      estimatedCostUsd: Math.max(0, Number(costUsd) || 0),
      duration,
    };
    setDays((prev) =>
      prev.map((day, idx) =>
        idx === activeDayIndex
          ? { ...day, activities: [...day.activities, item] }
          : day,
      ),
    );
    showToast(`Added "${actTitle.trim()}" to Day ${activeDayIndex + 1}`, 'success');
  };

  const removeActivity = (dayIdx: number, activityId: string) => {
    setDays((prev) =>
      prev.map((day, idx) =>
        idx === dayIdx
          ? { ...day, activities: day.activities.filter((a) => a.id !== activityId) }
          : day,
      ),
    );
  };

  const draftTrip: TripPlan = {
    id: editingId || `trip-${Date.now()}`,
    title: title.trim() || `${selectedDestination.name} Trip`,
    destinationId,
    departureDate,
    returnDate,
    travelers,
    targetBudgetUsd,
    pace,
    preferences,
    accommodationName,
    accommodationPerNightUsd,
    transportationMode,
    transportationCostUsd,
    days,
    status: existingTrip?.status || 'upcoming',
    createdAt: existingTrip?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const totalDays = days.length;
  const nights = Math.max(1, totalDays - 1);
  const lodgingCost = nights * accommodationPerNightUsd;
  const activitiesCost = days.reduce(
    (sum, d) =>
      sum + d.activities.reduce((ds, a) => ds + a.estimatedCostUsd * travelers, 0),
    0,
  );
  const mealsMiscCost = totalDays * travelers * 42;
  const estimatedTotal = calculateTripTotalUsd(draftTrip);
  const withinBudget = estimatedTotal <= targetBudgetUsd;

  const handleSaveTrip = (e: React.FormEvent) => {
    e.preventDefault();
    saveTrip(draftTrip);
    setEditingId(draftTrip.id);
    navigate('/saved');
  };

  const handleDeleteTrip = () => {
    if (!editingId) return;
    deleteTrip(editingId);
    navigate('/saved');
  };

  const activeDay = days[activeDayIndex] || days[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 md:pb-16 space-y-6">
      {/* Page Header & Quick Load Saved Trip */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#172B3A] tracking-tight">
            {editingId ? 'Edit Your Itinerary' : 'Trip Planner'}
          </h1>
          <p className="mt-1 text-sm text-[#172B3A]/70">
            Organize dates, lodging, transport, and day-by-day activities with live expense estimates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {trips.length > 0 && (
            <select
              aria-label="Load an existing saved trip to edit"
              value={editingId || ''}
              onChange={(e) => {
                const val = e.target.value;
                if (!val) {
                  navigate('/planner');
                  setEditingId(null);
                } else {
                  navigate(`/planner?tripId=${val}`);
                }
              }}
              className="h-11 px-3.5 rounded-xl bg-white border border-[#172B3A]/15 text-xs sm:text-sm font-medium text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#FF7043]"
            >
              <option value="">+ Start New Itinerary</option>
              {trips.map((t) => (
                <option key={t.id} value={t.id}>
                  Edit: {t.title}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <form onSubmit={handleSaveTrip} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Setup & Day Timeline */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Destination & Dates Card */}
          <section className="bg-white rounded-3xl border border-[#172B3A]/10 p-5 sm:p-6 space-y-5 shadow-xs">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="w-full sm:w-32 aspect-[4/3] rounded-2xl overflow-hidden shrink-0">
                <SafeImage
                  src={selectedDestination.heroImage}
                  alt={selectedDestination.name}
                  fallbackTitle={selectedDestination.name}
                  className="w-full h-full"
                />
              </div>

              <div className="flex-1 w-full space-y-3">
                <div>
                  <label htmlFor="planner-dest" className="block text-xs font-medium text-[#172B3A]/70 mb-1">
                    Destination
                  </label>
                  <select
                    id="planner-dest"
                    value={destinationId}
                    onChange={(e) => handleSelectDestination(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FCF9F3] border border-[#172B3A]/12 text-sm font-semibold text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#FF7043]"
                  >
                    {allDestinations.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}, {d.country} ({d.continent})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="planner-title" className="block text-xs font-medium text-[#172B3A]/70 mb-1">
                    Itinerary Name
                  </label>
                  <input
                    id="planner-title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FCF9F3] border border-[#172B3A]/12 text-sm text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#FF7043]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2 border-t border-[#172B3A]/8">
              <div>
                <label htmlFor="planner-dep" className="block text-xs font-medium text-[#172B3A]/70 mb-1">
                  Departure
                </label>
                <input
                  id="planner-dep"
                  type="date"
                  required
                  value={departureDate}
                  onChange={(e) => handleDateChange(e.target.value, returnDate)}
                  className="w-full h-11 px-3 rounded-xl bg-[#FCF9F3] border border-[#172B3A]/12 text-sm text-[#172B3A] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#FF7043]"
                />
              </div>

              <div>
                <label htmlFor="planner-ret" className="block text-xs font-medium text-[#172B3A]/70 mb-1">
                  Return
                </label>
                <input
                  id="planner-ret"
                  type="date"
                  required
                  min={departureDate}
                  value={returnDate}
                  onChange={(e) => handleDateChange(departureDate, e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-[#FCF9F3] border border-[#172B3A]/12 text-sm text-[#172B3A] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#FF7043]"
                />
              </div>

              <div>
                <span className="block text-xs font-medium text-[#172B3A]/70 mb-1">
                  Travelers
                </span>
                <div className="h-11 px-2 rounded-xl bg-[#FCF9F3] border border-[#172B3A]/12 flex items-center justify-between">
                  <button
                    type="button"
                    aria-label="Decrease travelers"
                    onClick={() => setTravelers((v) => Math.max(1, v - 1))}
                    className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg hover:bg-white cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-semibold tabular-nums inline-flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#006A64]" />
                    {travelers}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase travelers"
                    onClick={() => setTravelers((v) => Math.min(12, v + 1))}
                    className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg hover:bg-white cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="planner-budget" className="block text-xs font-medium text-[#172B3A]/70 mb-1">
                  Target Budget (USD)
                </label>
                <input
                  id="planner-budget"
                  type="number"
                  min={100}
                  step={50}
                  value={targetBudgetUsd}
                  onChange={(e) => setTargetBudgetUsd(Math.max(100, Number(e.target.value) || 0))}
                  className="w-full h-11 px-3 rounded-xl bg-[#FCF9F3] border border-[#172B3A]/12 text-sm font-semibold text-[#172B3A] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#FF7043]"
                />
              </div>
            </div>

            {/* Pace & Travel Style Preferences */}
            <div className="space-y-3 pt-2 border-t border-[#172B3A]/8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-medium text-[#172B3A]/70">Trip Pace</span>
                <div className="inline-flex p-1 rounded-xl bg-[#172B3A]/6">
                  {(['Relaxed', 'Balanced', 'Action-Packed'] as TripPace[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPace(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        pace === p
                          ? 'bg-white text-[#172B3A] shadow-xs'
                          : 'text-[#172B3A]/65 hover:text-[#172B3A]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-xs font-medium text-[#172B3A]/70 mb-2">
                  Focus Interests
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((cat) => {
                    const active = preferences.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => togglePref(cat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#006A64] text-white'
                            : 'bg-[#FCF9F3] text-[#172B3A]/75 border border-[#172B3A]/12 hover:border-[#172B3A]/30'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* 2. Accommodation & Transportation */}
          <section className="bg-white rounded-3xl border border-[#172B3A]/10 p-5 sm:p-6 space-y-4 shadow-xs">
            <h2 className="font-display text-lg font-bold text-[#172B3A]">
              Accommodation & Transportation
            </h2>

            {/* Quick pick from destination stays */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {selectedDestination.accommodations.map((stay) => {
                const isPicked = accommodationName === stay.name;
                return (
                  <button
                    key={stay.name}
                    type="button"
                    onClick={() => {
                      setAccommodationName(stay.name);
                      setAccommodationPerNightUsd(stay.estimatedPerNight);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-colors cursor-pointer ${
                      isPicked
                        ? 'bg-[#FCF9F3] border-[#FF7043] ring-1 ring-[#FF7043]'
                        : 'bg-white border-[#172B3A]/10 hover:border-[#172B3A]/25'
                    }`}
                  >
                    <p className="text-[11px] font-semibold text-[#006A64]">{stay.tier}</p>
                    <p className="text-xs font-semibold text-[#172B3A] truncate mt-0.5">
                      {stay.name}
                    </p>
                    <p className="text-xs text-[#172B3A]/65 tabular-nums mt-1">
                      {formatCurrency(stay.estimatedPerNight, profile.currency)}/night
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div>
                <label htmlFor="planner-stay" className="block text-xs font-medium text-[#172B3A]/70 mb-1">
                  Stay Name
                </label>
                <input
                  id="planner-stay"
                  type="text"
                  value={accommodationName}
                  onChange={(e) => setAccommodationName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#FCF9F3] border border-[#172B3A]/12 text-sm text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#FF7043]"
                />
              </div>

              <div>
                <label htmlFor="planner-stay-rate" className="block text-xs font-medium text-[#172B3A]/70 mb-1">
                  Nightly Rate (USD)
                </label>
                <input
                  id="planner-stay-rate"
                  type="number"
                  min={0}
                  value={accommodationPerNightUsd}
                  onChange={(e) =>
                    setAccommodationPerNightUsd(Math.max(0, Number(e.target.value) || 0))
                  }
                  className="w-full h-11 px-3.5 rounded-xl bg-[#FCF9F3] border border-[#172B3A]/12 text-sm text-[#172B3A] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#FF7043]"
                />
              </div>

              <div>
                <label htmlFor="planner-transport" className="block text-xs font-medium text-[#172B3A]/70 mb-1">
                  Transportation Mode
                </label>
                <input
                  id="planner-transport"
                  type="text"
                  value={transportationMode}
                  onChange={(e) => setTransportationMode(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#FCF9F3] border border-[#172B3A]/12 text-sm text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#FF7043]"
                />
              </div>

              <div>
                <label htmlFor="planner-transport-cost" className="block text-xs font-medium text-[#172B3A]/70 mb-1">
                  Total Transit Estimate (USD)
                </label>
                <input
                  id="planner-transport-cost"
                  type="number"
                  min={0}
                  value={transportationCostUsd}
                  onChange={(e) =>
                    setTransportationCostUsd(Math.max(0, Number(e.target.value) || 0))
                  }
                  className="w-full h-11 px-3.5 rounded-xl bg-[#FCF9F3] border border-[#172B3A]/12 text-sm text-[#172B3A] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#FF7043]"
                />
              </div>
            </div>
          </section>

          {/* 3. Interactive Day-by-Day Timeline */}
          <section className="bg-white rounded-3xl border border-[#172B3A]/10 p-5 sm:p-6 space-y-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-bold text-[#172B3A]">
                  Day-by-Day Timeline
                </h2>
                <p className="text-xs text-[#172B3A]/65">
                  Organize morning, afternoon, and evening experiences for each day.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#006A64] tabular-nums inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {days.length} {days.length === 1 ? 'Day' : 'Days'} · {nights} {nights === 1 ? 'Night' : 'Nights'}
              </span>
            </div>

            {/* Day Switcher Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {days.map((d, idx) => (
                <button
                  key={d.dayNumber}
                  type="button"
                  onClick={() => setActiveDayIndex(idx)}
                  className={`min-h-[40px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    activeDayIndex === idx
                      ? 'bg-[#172B3A] text-white'
                      : 'bg-[#FCF9F3] text-[#172B3A]/75 border border-[#172B3A]/12 hover:border-[#172B3A]/30'
                  }`}
                >
                  Day {d.dayNumber} ({d.activities.length})
                </button>
              ))}
            </div>

            {/* Active Day Title */}
            {activeDay && (
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="active-day-label"
                    className="block text-xs font-medium text-[#172B3A]/70 mb-1"
                  >
                    Day {activeDay.dayNumber} Theme
                  </label>
                  <input
                    id="active-day-label"
                    type="text"
                    value={activeDay.label}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDays((prev) =>
                        prev.map((d, i) =>
                          i === activeDayIndex ? { ...d, label: val } : d,
                        ),
                      );
                    }}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FCF9F3] border border-[#172B3A]/12 text-sm font-medium text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#FF7043]"
                  />
                </div>

                {/* Morning / Afternoon / Evening Timeline Slots */}
                <div className="space-y-4">
                  {SLOT_META.map(({ slot, icon: SlotIcon, label }) => {
                    const slotItems = activeDay.activities.filter(
                      (a) => a.timeSlot === slot,
                    );
                    return (
                      <div
                        key={slot}
                        className="rounded-2xl bg-[#FCF9F3] border border-[#172B3A]/8 p-4 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#006A64]">
                            <SlotIcon className="w-4 h-4 text-[#FF7043]" />
                            {label}
                          </span>
                          <span className="text-[11px] text-[#172B3A]/50 tabular-nums">
                            {slotItems.length}{' '}
                            {slotItems.length === 1 ? 'activity' : 'activities'}
                          </span>
                        </div>

                        {slotItems.length === 0 ? (
                          <p className="text-xs text-[#172B3A]/50 py-1">
                            Nothing scheduled for {label.toLowerCase()} yet.
                          </p>
                        ) : (
                          <ul className="space-y-2">
                            {slotItems.map((act) => (
                              <li
                                key={act.id}
                                className="bg-white rounded-xl border border-[#172B3A]/10 px-3.5 py-2.5 flex items-center justify-between gap-3"
                              >
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-[#172B3A] truncate">
                                    {act.title}
                                  </p>
                                  <p className="text-xs text-[#172B3A]/60 tabular-nums">
                                    {act.duration || '2 hrs'} ·{' '}
                                    {act.estimatedCostUsd === 0
                                      ? 'Free'
                                      : `${formatCurrency(act.estimatedCostUsd, profile.currency)}/guest`}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeActivity(activeDayIndex, act.id)}
                                  aria-label={`Remove ${act.title}`}
                                  className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-[#172B3A]/45 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Quick-Add Suggested Destination Experiences */}
                <div className="pt-3 border-t border-[#172B3A]/8 space-y-2.5">
                  <p className="text-xs font-semibold text-[#172B3A]/75">
                    Suggested experiences in {selectedDestination.name} (click to add to Day{' '}
                    {activeDay.dayNumber}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDestination.activities.map((sug) => (
                      <button
                        key={sug.id}
                        type="button"
                        onClick={() =>
                          addActivityToActiveDay(
                            sug.title,
                            sug.timeOfDay,
                            sug.estimatedCost,
                            sug.duration,
                          )
                        }
                        className="min-h-[38px] px-3 py-1.5 rounded-xl bg-[#9EF1E9]/30 hover:bg-[#9EF1E9]/55 text-[#172B3A] text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#006A64]" />
                        <span>
                          {sug.title} ({sug.timeOfDay})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add Custom Activity Inline Control */}
                <div className="pt-3 border-t border-[#172B3A]/8 space-y-2.5">
                  <p className="text-xs font-semibold text-[#172B3A]/75">
                    Add custom activity to Day {activeDay.dayNumber}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                    <select
                      aria-label="Time of day"
                      value={newSlot}
                      onChange={(e) => setNewSlot(e.target.value as TimeSlot)}
                      className="sm:col-span-3 h-11 px-3 rounded-xl bg-[#FCF9F3] border border-[#172B3A]/12 text-xs sm:text-sm font-medium text-[#172B3A]"
                    >
                      <option value="Morning">Morning</option>
                      <option value="Afternoon">Afternoon</option>
                      <option value="Evening">Evening</option>
                    </select>

                    <input
                      type="text"
                      value={newActivityTitle}
                      onChange={(e) => setNewActivityTitle(e.target.value)}
                      placeholder="e.g. Sunrise kayak or local market walk"
                      aria-label="Custom activity name"
                      className="sm:col-span-5 h-11 px-3.5 rounded-xl bg-[#FCF9F3] border border-[#172B3A]/12 text-sm text-[#172B3A]"
                    />

                    <input
                      type="number"
                      min={0}
                      value={newActivityCost}
                      onChange={(e) => setNewActivityCost(e.target.value)}
                      placeholder="USD/guest"
                      aria-label="Estimated cost per guest in USD"
                      className="sm:col-span-2 h-11 px-3 rounded-xl bg-[#FCF9F3] border border-[#172B3A]/12 text-sm text-[#172B3A] tabular-nums"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        if (!newActivityTitle.trim()) return;
                        addActivityToActiveDay(
                          newActivityTitle,
                          newSlot,
                          Number(newActivityCost) || 0,
                        );
                        setNewActivityTitle('');
                      }}
                      className="sm:col-span-2 min-h-[44px] px-3 rounded-xl bg-[#172B3A] text-white text-xs sm:text-sm font-semibold hover:bg-[#080C10] transition-colors cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Sticky Budget Summary & Save Actions */}
        <aside className="lg:col-span-4 lg:sticky lg:top-20 space-y-4">
          <div className="bg-[#172B3A] text-white rounded-3xl p-6 space-y-5 shadow-md">
            <div>
              <p className="text-xs text-[#9EF1E9] font-medium">
                {selectedDestination.name}, {selectedDestination.country}
              </p>
              <h2 className="font-display text-2xl font-bold mt-1">
                Estimated Expenses
              </h2>
              <p className="text-xs text-white/65 mt-0.5 tabular-nums">
                {totalDays} days · {nights} nights · {travelers}{' '}
                {travelers === 1 ? 'traveler' : 'travelers'}
              </p>
            </div>

            <div className="space-y-3 pt-3 border-t border-white/10 text-sm tabular-nums">
              <div className="flex items-center justify-between">
                <span className="text-white/75">
                  Lodging ({nights} nights)
                </span>
                <span className="font-semibold">
                  {formatCurrency(lodgingCost, profile.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/75">Transportation</span>
                <span className="font-semibold">
                  {formatCurrency(transportationCostUsd, profile.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/75">Scheduled Activities</span>
                <span className="font-semibold">
                  {formatCurrency(activitiesCost, profile.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/75">Meals & Daily Misc</span>
                <span className="font-semibold">
                  {formatCurrency(mealsMiscCost, profile.currency)}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/15">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-white/80">Estimated Total</span>
                <span className="font-display text-3xl font-bold text-[#9EF1E9] tabular-nums">
                  {formatCurrency(estimatedTotal, profile.currency)}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between text-xs tabular-nums">
                <span className="text-white/65">
                  Target: {formatCurrency(targetBudgetUsd, profile.currency)}
                </span>
                <span
                  className={`font-semibold ${
                    withinBudget ? 'text-[#9EF1E9]' : 'text-[#FF7043]'
                  }`}
                >
                  {withinBudget ? 'Within budget' : 'Over target budget'}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="submit"
                className="w-full min-h-[48px] px-5 py-3 rounded-2xl bg-[#FF7043] hover:bg-[#e85d31] text-white font-display font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{editingId ? 'Update Itinerary' : 'Save Itinerary'}</span>
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={handleDeleteTrip}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-red-500/20 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Itinerary</span>
                </button>
              )}

              <Link
                to="/saved"
                className="block text-center text-xs text-white/75 hover:text-white pt-1"
              >
                View all saved trips & wishlist →
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#172B3A]/10 p-4 text-xs text-[#172B3A]/70 flex items-start gap-2.5">
            <Compass className="w-4 h-4 text-[#006A64] shrink-0 mt-0.5" />
            <span>
              All trip itineraries save automatically to your browser storage so your plans stay ready when you return.
            </span>
          </div>
        </aside>
      </form>
    </div>
  );
}
