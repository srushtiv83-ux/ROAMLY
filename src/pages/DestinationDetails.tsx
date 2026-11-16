import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bookmark,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  MapPin,
  Plane,
  Share2,
  Star,
  UserCheck,
  Wallet,
} from 'lucide-react';
import { destinationService } from '../services/destinationService';
import { useRoamly } from '../context/RoamlyContext';
import { formatCurrency } from '../services/storage';
import { ImageGallery } from '../components/ImageGallery';

export function DestinationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isBookmarked, toggleBookmark, profile, showToast } = useRoamly();

  const destination = id ? destinationService.getById(id) : undefined;

  if (!destination) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <Compass className="w-12 h-12 text-[#FF7043] mx-auto" />
        <h1 className="font-display text-3xl font-bold text-[#172B3A]">
          Destination not found
        </h1>
        <p className="text-sm text-[#172B3A]/70">
          We couldn’t find that destination in our global guide. Browse all places in Explore.
        </p>
        <Link
          to="/explore"
          className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded-full bg-[#172B3A] text-white text-sm font-semibold"
        >
          Return to Explore
        </Link>
      </div>
    );
  }

  const saved = isBookmarked(destination.id);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast(`Copied link to ${destination.name}`, 'success');
    } catch {
      showToast(`Ready to share ${destination.name}`, 'default');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-28 md:pb-16 space-y-8">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="min-h-[44px] px-3.5 py-2 rounded-full bg-white border border-[#172B3A]/12 text-xs sm:text-sm font-medium text-[#172B3A] hover:bg-[#172B3A]/5 inline-flex items-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            aria-label={`Share ${destination.name}`}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-white border border-[#172B3A]/12 text-[#172B3A] hover:bg-[#172B3A]/5 transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => toggleBookmark(destination.id, destination.name)}
            aria-pressed={saved}
            className={`min-h-[44px] px-4 py-2 rounded-full text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer ${
              saved
                ? 'bg-[#FF7043] text-white'
                : 'bg-white border border-[#172B3A]/15 text-[#172B3A] hover:bg-[#172B3A]/5'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
            <span>{saved ? 'Saved to Wishlist' : 'Save to Wishlist'}</span>
          </button>
        </div>
      </div>

      {/* Hero Header & Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7">
          <ImageGallery images={destination.galleryImages} title={destination.name} />
        </div>

        <div className="lg:col-span-5 space-y-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#006A64] font-medium">
              <span>{destination.continent}</span>
              <span aria-hidden="true">·</span>
              <span>{destination.category}</span>
              {destination.isHiddenGem && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#FF7043] font-semibold">Hidden Gem</span>
                </>
              )}
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#172B3A] mt-2 leading-tight">
              {destination.name}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#172B3A]/75">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#FF7043]" />
                {destination.city}, {destination.country}
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-[#172B3A] tabular-nums">
                <Star className="w-4 h-4 text-[#FF7043] fill-[#FF7043]" />
                {destination.rating.toFixed(1)}{' '}
                <span className="font-normal text-[#172B3A]/60">
                  ({destination.reviewCount.toLocaleString()} reviews)
                </span>
              </span>
            </div>
          </div>

          <p className="text-base text-[#172B3A]/80 leading-relaxed">
            {destination.description}
          </p>

          {/* Key Planning Metrics Strip */}
          <div className="grid grid-cols-2 gap-3 bg-white rounded-2xl border border-[#172B3A]/10 p-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-[#172B3A]/55">
                <Wallet className="w-3.5 h-3.5 text-[#006A64]" />
                <span>Est. Daily Budget</span>
              </div>
              <p className="font-display text-lg font-bold text-[#172B3A] mt-0.5 tabular-nums">
                {formatCurrency(destination.dailyBudgetUsd, profile.currency)} / day
              </p>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs text-[#172B3A]/55">
                <Clock className="w-3.5 h-3.5 text-[#006A64]" />
                <span>Ideal Duration</span>
              </div>
              <p className="font-display text-lg font-bold text-[#172B3A] mt-0.5">
                {destination.recommendedDuration}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs text-[#172B3A]/55">
                <Calendar className="w-3.5 h-3.5 text-[#006A64]" />
                <span>Best Season</span>
              </div>
              <p className="text-sm font-semibold text-[#172B3A] mt-0.5">
                {destination.bestSeason}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs text-[#172B3A]/55">
                <Compass className="w-3.5 h-3.5 text-[#006A64]" />
                <span>Access & Fit</span>
              </div>
              <p className="text-sm font-semibold text-[#172B3A] mt-0.5 flex items-center gap-2">
                {destination.soloFriendly && (
                  <span className="inline-flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-[#006A64]" /> Solo
                  </span>
                )}
                {destination.directFlight && (
                  <span className="inline-flex items-center gap-1">
                    <Plane className="w-3.5 h-3.5 text-[#006A64]" /> Direct
                  </span>
                )}
                {!destination.soloFriendly && !destination.directFlight && 'Guided / Multi-leg'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/planner?destination=${destination.id}`)}
            className="w-full min-h-[52px] px-6 py-3.5 rounded-2xl bg-[#FF7043] hover:bg-[#e85d31] text-white font-display font-semibold text-base shadow-sm inline-flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
          >
            <Compass className="w-5 h-5" />
            <span>Plan Your Adventure in {destination.name}</span>
          </button>

          <p className="text-[11px] text-[#172B3A]/50">
            Demonstration guide data: budgets, seasonal windows, and sample reviews are curated estimates for trip planning.
          </p>
        </div>
      </div>

      {/* Attractions & Local Experiences */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="bg-white rounded-2xl border border-[#172B3A]/10 p-6 space-y-4">
          <h2 className="font-display text-xl font-bold text-[#172B3A]">
            Popular Attractions
          </h2>
          <ul className="space-y-3">
            {destination.popularAttractions.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-[#172B3A]/85">
                <CheckCircle2 className="w-4 h-4 text-[#006A64] shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-[#172B3A]/10 p-6 space-y-4">
          <h2 className="font-display text-xl font-bold text-[#172B3A]">
            Authentic Local Experiences
          </h2>
          <ul className="space-y-3">
            {destination.localExperiences.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-[#172B3A]/85">
                <CheckCircle2 className="w-4 h-4 text-[#FF7043] shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Recommended Activities */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#172B3A]">
              Recommended Daily Rhythm
            </h2>
            <p className="text-sm text-[#172B3A]/65">
              Morning, afternoon, and evening experiences ready to drop into your itinerary.
            </p>
          </div>
          <Link
            to={`/planner?destination=${destination.id}`}
            className="text-sm font-semibold text-[#FF7043] hover:underline whitespace-nowrap"
          >
            Add to Trip Planner →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {destination.activities.map((act) => (
            <div
              key={act.id}
              className="bg-white rounded-2xl border border-[#172B3A]/10 p-5 flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-[#006A64] font-semibold mb-1.5">
                  <span>{act.timeOfDay}</span>
                  <span className="tabular-nums text-[#172B3A]/60">{act.duration}</span>
                </div>
                <h3 className="font-display text-lg font-semibold text-[#172B3A]">
                  {act.title}
                </h3>
                <p className="mt-1.5 text-sm text-[#172B3A]/70 leading-relaxed">
                  {act.description}
                </p>
              </div>
              <div className="pt-3 border-t border-[#172B3A]/8 flex items-center justify-between text-xs">
                <span className="font-semibold text-[#172B3A] tabular-nums">
                  {act.estimatedCost === 0
                    ? 'Free entry'
                    : `Est. ${formatCurrency(act.estimatedCost, profile.currency)}`}
                </span>
                <button
                  type="button"
                  onClick={() => navigate(`/planner?destination=${destination.id}`)}
                  className="text-[#FF7043] font-semibold hover:underline cursor-pointer"
                >
                  Use in planner →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Accommodation Suggestions */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-[#172B3A]">
          Where to Stay
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {destination.accommodations.map((stay) => (
            <div
              key={stay.name}
              className="bg-white rounded-2xl border border-[#172B3A]/10 p-5 flex flex-col justify-between gap-2"
            >
              <div>
                <p className="text-xs font-semibold text-[#006A64]">
                  {stay.tier} · {stay.neighborhood}
                </p>
                <h3 className="font-display text-lg font-semibold text-[#172B3A] mt-1">
                  {stay.name}
                </h3>
                <p className="mt-1.5 text-sm text-[#172B3A]/70">{stay.note}</p>
              </div>
              <p className="pt-3 border-t border-[#172B3A]/8 text-sm font-semibold text-[#172B3A] tabular-nums">
                Est. {formatCurrency(stay.estimatedPerNight, profile.currency)} / night
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Travel Tips & Sample Reviews */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#172B3A] text-white rounded-2xl p-6 space-y-4">
          <h2 className="font-display text-xl font-bold">Essential Travel Tips</h2>
          <ul className="space-y-3 text-sm text-white/85">
            {destination.travelTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="font-display font-bold text-[#9EF1E9] tabular-nums">
                  0{i + 1}.
                </span>
                <span className="leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-[#172B3A]/10 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-[#172B3A]">
              Traveler Notes
            </h2>
            <span className="text-xs text-[#172B3A]/55">Demo traveler excerpts</span>
          </div>
          <div className="space-y-4">
            {destination.reviews.map((rev) => (
              <div
                key={rev.id}
                className="pb-4 border-b border-[#172B3A]/8 last:border-b-0 last:pb-0"
              >
                <div className="flex items-center justify-between text-xs text-[#172B3A]/60">
                  <span className="font-semibold text-[#172B3A]">
                    {rev.author} · {rev.origin}
                  </span>
                  <span className="inline-flex items-center gap-1 tabular-nums text-[#172B3A]">
                    <Star className="w-3.5 h-3.5 text-[#FF7043] fill-[#FF7043]" />
                    {rev.rating.toFixed(1)} · {rev.date}
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-[#172B3A]/80 leading-relaxed">
                  {rev.comment}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
