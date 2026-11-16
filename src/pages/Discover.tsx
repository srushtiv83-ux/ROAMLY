import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Compass, Sparkles } from 'lucide-react';
import { Continent } from '../types';
import { useRoamly } from '../context/RoamlyContext';
import { destinationService } from '../services/destinationService';
import { formatCurrency } from '../services/storage';
import { SearchBar } from '../components/SearchBar';
import { ContinentFilterBar } from '../components/FilterChips';
import { Globe } from '../components/Globe';
import { DestinationCard } from '../components/DestinationCard';
import { SafeImage } from '../components/SafeImage';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function Discover() {
  const { profile, bookmarks, trips } = useRoamly();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContinent, setSelectedContinent] = useState<Continent | 'All'>('All');
  const navigate = useNavigate();

  const continentFiltered = useMemo(
    () => destinationService.filter({ continent: selectedContinent }),
    [selectedContinent],
  );

  const trendingDestinations = useMemo(() => {
    const base = destinationService.getTrending();
    if (selectedContinent === 'All') return base;
    const narrowed = base.filter((d) => d.continent === selectedContinent);
    return narrowed.length > 0 ? narrowed : continentFiltered;
  }, [selectedContinent, continentFiltered]);

  const hiddenGems = useMemo(() => {
    const base = destinationService.getHiddenGems();
    if (selectedContinent === 'All') return base;
    const narrowed = base.filter((d) => d.continent === selectedContinent);
    return narrowed.length > 0 ? narrowed : continentFiltered.slice(0, 4);
  }, [selectedContinent, continentFiltered]);

  const madeForYou = useMemo(
    () => destinationService.getRecommendedForCategories(profile.preferredCategories),
    [profile.preferredCategories],
  );

  const featuredExperiences = useMemo(() => {
    const picks = ['kyoto-japan', 'machu-picchu-peru', 'queenstown-nz'];
    return picks
      .map((id) => destinationService.getById(id))
      .filter((d): d is NonNullable<typeof d> => Boolean(d));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:pb-14 space-y-10">
      {/* Greeting & Search Hero */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs sm:text-sm font-medium text-[#006A64]">
            {getGreeting()}, {profile.name.split(' ')[0]} · {bookmarks.length} saved ·{' '}
            {trips.length} {trips.length === 1 ? 'trip' : 'trips'} planned
          </p>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#172B3A] tracking-tight leading-[1.1]">
            Where will your curiosity take you next?
          </h1>
        </div>

        <div className="w-full lg:w-[420px] shrink-0">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            showInstantDropdown
            placeholder="Search Kyoto, Bali, Santorini, Banff..."
            onSubmit={() => {
              if (searchQuery.trim()) {
                navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
              } else {
                navigate('/explore');
              }
            }}
          />
        </div>
      </section>

      {/* Explore by Continent + 3D Interactive Earth Globe */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#172B3A]">
              Explore the Globe
            </h2>
            <p className="text-xs sm:text-sm text-[#172B3A]/65">
              Select a continent to rotate the globe or click any destination pin.
            </p>
          </div>
          <Link
            to={`/explore${
              selectedContinent !== 'All'
                ? `?continent=${encodeURIComponent(selectedContinent)}`
                : ''
            }`}
            className="text-xs sm:text-sm font-semibold text-[#FF7043] hover:underline inline-flex items-center gap-1 whitespace-nowrap"
          >
            <span>Open full directory ({continentFiltered.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <ContinentFilterBar selected={selectedContinent} onSelect={setSelectedContinent} />

        <Globe destinations={continentFiltered} selectedContinent={selectedContinent} />
      </section>

      {/* Trending Worldwide Carousel */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#172B3A]">
              Trending Worldwide
            </h2>
            <p className="text-sm text-[#172B3A]/65">
              Most-saved destinations across {selectedContinent === 'All' ? 'every continent' : selectedContinent}.
            </p>
          </div>
          <Link
            to="/explore"
            className="text-sm font-semibold text-[#006A64] hover:underline whitespace-nowrap"
          >
            View all →
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 snap-x snap-mandatory">
          {trendingDestinations.map((dest) => (
            <div key={dest.id} className="w-[270px] sm:w-[300px] shrink-0 snap-start">
              <DestinationCard destination={dest} />
            </div>
          ))}
        </div>
      </section>

      {/* Hidden Gems Carousel */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#172B3A]">
              Hidden Gems
            </h2>
            <p className="text-sm text-[#172B3A]/65">
              Quiet coastal coves, alpine valleys, and off-the-beaten-path escapes.
            </p>
          </div>
          <Link
            to="/explore?hidden=true"
            className="text-sm font-semibold text-[#006A64] hover:underline whitespace-nowrap"
          >
            Explore hidden gems →
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 snap-x snap-mandatory">
          {hiddenGems.map((dest) => (
            <div key={dest.id} className="w-[270px] sm:w-[300px] shrink-0 snap-start">
              <DestinationCard destination={dest} />
            </div>
          ))}
        </div>
      </section>

      {/* Made for You Personalized Grid */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF7043] mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalized for your profile</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-[#172B3A]">
              Made for You
            </h2>
            <p className="text-sm text-[#172B3A]/65">
              Matched to {profile.preferredCategories.join(' · ') || 'your travel style'}.
            </p>
          </div>
          <Link
            to="/profile"
            className="text-sm font-semibold text-[#006A64] hover:underline whitespace-nowrap"
          >
            Adjust preferences →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {madeForYou.slice(0, 4).map((dest) => (
            <DestinationCard key={dest.id} destination={dest} />
          ))}
        </div>
      </section>

      {/* Featured Travel Experiences Spotlight */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#172B3A]">
            Featured Travel Experiences
          </h2>
          <p className="text-sm text-[#172B3A]/65">
            Signature mornings, local workshops, and scenic crossings ready to add to your itinerary.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {featuredExperiences.map((dest) => {
            const leadActivity = dest.activities[0];
            return (
              <div
                key={dest.id}
                className="bg-[#172B3A] text-white rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm"
              >
                <div className="aspect-[16/10] relative">
                  <SafeImage
                    src={dest.heroImage}
                    alt={leadActivity?.title || dest.name}
                    fallbackTitle={dest.name}
                    className="w-full h-full"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-[#172B3A] via-transparent to-transparent"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-[#9EF1E9]">
                      {dest.name}, {dest.country} · {leadActivity?.duration || dest.recommendedDuration}
                    </p>
                    <h3 className="font-display text-lg font-semibold mt-1 leading-snug">
                      {leadActivity?.title || dest.tagline}
                    </h3>
                    <p className="mt-2 text-xs text-white/75 leading-relaxed line-clamp-2">
                      {leadActivity?.description || dest.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs text-white/75 tabular-nums">
                      Est. {formatCurrency(leadActivity?.estimatedCost || 35, profile.currency)} / guest
                    </span>
                    <Link
                      to={`/planner?destination=${dest.id}`}
                      className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#FF7043] hover:bg-[#e85d31] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Plan This Trip</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
