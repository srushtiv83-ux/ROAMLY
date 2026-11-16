import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, Calendar, Compass, Map, Plus, Trash2 } from 'lucide-react';
import { useBookmarks } from '../hooks/useBookmarks';
import { useTrips } from '../hooks/useTrips';
import { useRoamly } from '../context/RoamlyContext';
import { formatCurrency } from '../services/storage';
import { SafeImage } from '../components/SafeImage';
import { TripCard } from '../components/TripCard';

export function SavedTrips() {
  const navigate = useNavigate();
  const { profile } = useRoamly();
  const { savedDestinations, toggleBookmark } = useBookmarks();
  const { trips, upcomingTrips, completedTrips, deleteTrip, toggleTripStatus } = useTrips();

  const [tripFilter, setTripFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const displayedTrips =
    tripFilter === 'upcoming'
      ? upcomingTrips
      : tripFilter === 'completed'
      ? completedTrips
      : trips;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 md:pb-16 space-y-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#172B3A] tracking-tight">
            Saved Trips & Wishlist
          </h1>
          <p className="mt-1 text-sm text-[#172B3A]/70">
            Your bookmarked global destinations and personalized travel itineraries.
          </p>
        </div>

        <Link
          to="/planner"
          className="min-h-[44px] px-5 py-2.5 rounded-full bg-[#FF7043] hover:bg-[#e85d31] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 self-start sm:self-auto transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Itinerary</span>
        </Link>
      </div>

      {/* SECTION 1: WISHLIST */}
      <section aria-labelledby="wishlist-heading" className="space-y-4">
        <div className="flex items-center justify-between gap-4 border-b border-[#172B3A]/10 pb-3">
          <div className="flex items-center gap-2.5">
            <Bookmark className="w-5 h-5 text-[#FF7043]" />
            <h2 id="wishlist-heading" className="font-display text-2xl font-bold text-[#172B3A]">
              Wishlist ({savedDestinations.length})
            </h2>
          </div>
          <Link
            to="/explore"
            className="text-xs sm:text-sm font-semibold text-[#006A64] hover:underline"
          >
            Discover more places →
          </Link>
        </div>

        {savedDestinations.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#172B3A]/10 p-8 text-center space-y-3">
            <Bookmark className="w-9 h-9 text-[#172B3A]/35 mx-auto" />
            <h3 className="font-display text-xl font-semibold text-[#172B3A]">
              Your wishlist is empty
            </h3>
            <p className="text-sm text-[#172B3A]/65 max-w-md mx-auto">
              Tap the bookmark icon on any destination card to save places you want to visit later.
            </p>
            <Link
              to="/explore"
              className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded-full bg-[#172B3A] text-white text-sm font-semibold"
            >
              Browse Destinations
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {savedDestinations.map((dest) => (
              <article
                key={dest.id}
                className="bg-white rounded-2xl border border-[#172B3A]/10 overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <Link
                  to={`/destination/${dest.id}`}
                  className="block aspect-[16/10] relative overflow-hidden group"
                >
                  <SafeImage
                    src={dest.heroImage}
                    alt={`${dest.name}, ${dest.country}`}
                    fallbackTitle={dest.name}
                    className="w-full h-full group-hover:scale-[1.03] transition-transform duration-300"
                  />
                </Link>

                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <p className="text-xs text-[#172B3A]/60">
                      {dest.city}, {dest.country} · {dest.continent}
                    </p>
                    <Link to={`/destination/${dest.id}`}>
                      <h3 className="font-display text-xl font-semibold text-[#172B3A] mt-0.5 hover:text-[#006A64] transition-colors">
                        {dest.name}
                      </h3>
                    </Link>
                    <p className="mt-1 text-sm font-semibold text-[#006A64] tabular-nums">
                      Est. {formatCurrency(dest.dailyBudgetUsd, profile.currency)}/day ·{' '}
                      <span className="text-[#172B3A]/65 font-normal">
                        {dest.recommendedDuration}
                      </span>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#172B3A]/8 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/planner?destination=${dest.id}`)}
                      className="flex-1 min-h-[42px] px-3.5 py-2 rounded-xl bg-[#172B3A] hover:bg-[#080C10] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Start Planning</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleBookmark(dest.id, dest.name)}
                      aria-label={`Remove ${dest.name} from wishlist`}
                      className="min-h-[42px] px-3 py-2 rounded-xl border border-[#172B3A]/15 text-xs font-medium text-[#172B3A]/75 hover:text-red-600 hover:border-red-200 hover:bg-red-50 inline-flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: MY TRIPS */}
      <section aria-labelledby="mytrips-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#172B3A]/10 pb-3">
          <div className="flex items-center gap-2.5">
            <Map className="w-5 h-5 text-[#006A64]" />
            <h2 id="mytrips-heading" className="font-display text-2xl font-bold text-[#172B3A]">
              My Trips ({trips.length})
            </h2>
          </div>

          <div
            role="group"
            aria-label="Filter trips by status"
            className="inline-flex items-center p-1 rounded-xl bg-[#172B3A]/8"
          >
            {(
              [
                { id: 'all', label: `All (${trips.length})` },
                { id: 'upcoming', label: `Upcoming (${upcomingTrips.length})` },
                { id: 'completed', label: `Completed (${completedTrips.length})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTripFilter(tab.id)}
                className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  tripFilter === tab.id
                    ? 'bg-white text-[#172B3A] shadow-xs'
                    : 'text-[#172B3A]/65 hover:text-[#172B3A]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {displayedTrips.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#172B3A]/10 p-8 text-center space-y-3">
            <Calendar className="w-9 h-9 text-[#172B3A]/35 mx-auto" />
            <h3 className="font-display text-xl font-semibold text-[#172B3A]">
              No {tripFilter === 'all' ? '' : tripFilter} trips yet
            </h3>
            <p className="text-sm text-[#172B3A]/65 max-w-md mx-auto">
              Open the Trip Planner to build a custom day-by-day itinerary and budget estimate.
            </p>
            <Link
              to="/planner"
              className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded-full bg-[#FF7043] text-white text-sm font-semibold"
            >
              Create Your First Trip
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onEdit={(id) => navigate(`/planner?tripId=${id}`)}
                onDelete={(id) => setConfirmDeleteId(id)}
                onToggleStatus={toggleTripStatus}
              />
            ))}
          </div>
        )}
      </section>

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-trip-title"
          className="fixed inset-0 z-50 bg-[#080C10]/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="w-full max-w-sm bg-[#FCF9F3] rounded-3xl border border-[#172B3A]/12 p-6 space-y-4 shadow-xl">
            <h3 id="delete-trip-title" className="font-display text-xl font-bold text-[#172B3A]">
              Delete this itinerary?
            </h3>
            <p className="text-sm text-[#172B3A]/70">
              This will permanently remove the trip plan and its scheduled daily activities.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="min-h-[42px] px-4 py-2 rounded-xl border border-[#172B3A]/15 text-xs font-semibold text-[#172B3A] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteTrip(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="min-h-[42px] px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
              >
                Delete Trip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
