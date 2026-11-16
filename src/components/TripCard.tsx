import React from 'react';
import { Calendar, CheckCircle2, Edit3, Trash2, Users } from 'lucide-react';
import { TripPlan } from '../types';
import { destinationService } from '../services/destinationService';
import { calculateTripTotalUsd } from '../hooks/useTrips';
import { formatCurrency } from '../services/storage';
import { useRoamly } from '../context/RoamlyContext';
import { SafeImage } from './SafeImage';

interface TripCardProps {
  trip: TripPlan;
  onEdit: (tripId: string) => void;
  onDelete: (tripId: string) => void;
  onToggleStatus: (tripId: string) => void;
}

export function TripCard({ trip, onEdit, onDelete, onToggleStatus }: TripCardProps) {
  const { profile } = useRoamly();
  const destination = destinationService.getById(trip.destinationId);
  const estimatedTotal = calculateTripTotalUsd(trip);
  const activityCount = trip.days.reduce((sum, d) => sum + d.activities.length, 0);

  return (
    <article className="bg-white rounded-2xl border border-[#172B3A]/10 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col sm:flex-row">
      <div className="sm:w-52 lg:w-60 aspect-[16/10] sm:aspect-auto shrink-0 relative">
        <SafeImage
          src={destination?.heroImage || ''}
          alt={destination ? `${destination.name}, ${destination.country}` : trip.title}
          fallbackTitle={destination?.name || trip.title}
          className="w-full h-full"
        />
      </div>

      <div className="flex-1 p-5 flex flex-col justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#172B3A]/60 mb-1.5">
            <span>
              {destination ? `${destination.name}, ${destination.country}` : 'Custom Destination'} ·{' '}
              {trip.pace} Pace
            </span>
            <span
              className={`font-semibold ${
                trip.status === 'completed' ? 'text-[#006A64]' : 'text-[#FF7043]'
              }`}
            >
              {trip.status === 'completed' ? 'Completed' : 'Upcoming'}
            </span>
          </div>

          <h3 className="font-display text-xl font-semibold text-[#172B3A] leading-snug">
            {trip.title}
          </h3>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-[#172B3A]/75 tabular-nums">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#006A64]" />
              {trip.departureDate} → {trip.returnDate}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#006A64]" />
              {trip.travelers} {trip.travelers === 1 ? 'traveler' : 'travelers'}
            </span>
            <span>
              {trip.days.length} {trip.days.length === 1 ? 'day' : 'days'} · {activityCount}{' '}
              activities
            </span>
          </div>

          {trip.days[0]?.activities[0] && (
            <p className="mt-2.5 text-xs text-[#172B3A]/65 line-clamp-1">
              Highlights: {trip.days.map((d) => d.label).slice(0, 3).join(' · ')}
            </p>
          )}
        </div>

        <div className="pt-3 border-t border-[#172B3A]/8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] text-[#172B3A]/55">Estimated total</p>
            <p className="font-display text-lg font-bold text-[#172B3A] tabular-nums">
              {formatCurrency(estimatedTotal, profile.currency)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleStatus(trip.id)}
              className="min-h-[40px] px-3 py-2 rounded-xl border border-[#172B3A]/12 text-xs font-medium text-[#172B3A] hover:bg-[#FCF9F3] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#006A64]" />
              <span>{trip.status === 'upcoming' ? 'Mark Done' : 'Reopen'}</span>
            </button>
            <button
              type="button"
              onClick={() => onEdit(trip.id)}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#172B3A] text-white text-xs font-medium hover:bg-[#080C10] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => onDelete(trip.id)}
              aria-label={`Delete ${trip.title}`}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
