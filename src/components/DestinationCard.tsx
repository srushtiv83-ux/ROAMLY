import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Star } from 'lucide-react';
import { Destination } from '../types';
import { useRoamly } from '../context/RoamlyContext';
import { formatCurrency } from '../services/storage';
import { SafeImage } from './SafeImage';

interface DestinationCardProps {
  destination: Destination;
  variant?: 'default' | 'compact';
}

export function DestinationCard({ destination, variant = 'default' }: DestinationCardProps) {
  const { isBookmarked, toggleBookmark, profile } = useRoamly();
  const saved = isBookmarked(destination.id);

  return (
    <article className="group relative flex flex-col bg-white rounded-2xl border border-[#172B3A]/8 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200">
      <div className={`relative overflow-hidden ${variant === 'compact' ? 'aspect-[4/3]' : 'aspect-[4/3]'}`}>
        <Link
          to={`/destination/${destination.id}`}
          className="block w-full h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF7043]"
          aria-label={`Explore ${destination.name}, ${destination.country}`}
        >
          <SafeImage
            src={destination.heroImage}
            alt={`${destination.name}, ${destination.country}`}
            fallbackTitle={destination.name}
            className="w-full h-full group-hover:scale-[1.03] transition-transform duration-300"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#080C10]/65 via-[#080C10]/20 to-transparent pointer-events-none"
          />
        </Link>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleBookmark(destination.id, destination.name);
          }}
          aria-label={saved ? `Remove ${destination.name} from wishlist` : `Save ${destination.name} to wishlist`}
          aria-pressed={saved}
          className={`absolute top-3 right-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full backdrop-blur-md transition-transform duration-150 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7043] ${
            saved
              ? 'bg-[#FF7043] text-white shadow-sm'
              : 'bg-[#080C10]/45 text-white hover:bg-[#080C10]/70'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
        </button>

        {destination.isHiddenGem && (
          <div className="absolute bottom-3 left-3 text-[11px] font-medium text-[#9EF1E9] tracking-wide pointer-events-none">
            Hidden Gem
          </div>
        )}
      </div>

      <Link
        to={`/destination/${destination.id}`}
        className="flex-1 flex flex-col justify-between p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF7043]"
      >
        <div>
          <div className="flex items-center justify-between gap-2 text-xs text-[#172B3A]/60 mb-1">
            <span className="truncate">
              {destination.country} · {destination.category}
            </span>
            <span className="inline-flex items-center gap-1 text-[#172B3A] font-medium shrink-0 tabular-nums">
              <Star className="w-3.5 h-3.5 text-[#FF7043] fill-[#FF7043]" aria-hidden="true" />
              {destination.rating.toFixed(1)}
            </span>
          </div>

          <h3 className="font-display text-lg font-semibold text-[#172B3A] leading-snug group-hover:text-[#006A64] transition-colors">
            {destination.name}
          </h3>

          {variant === 'default' && (
            <p className="mt-1.5 text-sm text-[#172B3A]/70 line-clamp-2 leading-relaxed">
              {destination.tagline}
            </p>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-[#172B3A]/8 flex items-center justify-between text-xs">
          <span className="text-[#172B3A]/60">{destination.recommendedDuration}</span>
          <span className="font-semibold text-[#006A64] tabular-nums">
            Est. {formatCurrency(destination.dailyBudgetUsd, profile.currency)}/day
          </span>
        </div>
      </Link>
    </article>
  );
}
