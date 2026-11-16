import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Star } from 'lucide-react';
import { Destination } from '../types';
import { formatCurrency } from '../services/storage';
import { useRoamly } from '../context/RoamlyContext';
import { SafeImage } from './SafeImage';

interface WorldMapViewProps {
  destinations: Destination[];
}

function projectToPercent(lat: number, lng: number) {
  const x = ((lng + 180) / 360) * 100;
  const y = ((90 - lat) / 180) * 100;
  return {
    x: Math.max(4, Math.min(96, x)),
    y: Math.max(6, Math.min(92, y)),
  };
}

export function WorldMapView({ destinations }: WorldMapViewProps) {
  const [activeId, setActiveId] = useState<string>(destinations[0]?.id || '');
  const { profile } = useRoamly();

  const activeDest = useMemo(
    () => destinations.find((d) => d.id === activeId) || destinations[0],
    [destinations, activeId],
  );

  return (
    <div className="space-y-4">
      <div className="relative w-full aspect-[16/10] sm:aspect-[2/1] rounded-3xl bg-[#0D2030] border border-[#172B3A]/15 overflow-hidden shadow-sm">
        {/* Stylized SVG Equirectangular Continents */}
        <svg
          viewBox="0 0 1000 500"
          className="w-full h-full object-cover"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="oceanMapGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0C1E2E" />
              <stop offset="50%" stopColor="#123146" />
              <stop offset="100%" stopColor="#0A1A28" />
            </linearGradient>
          </defs>
          <rect width="1000" height="500" fill="url(#oceanMapGrad)" />

          {/* Graticule lines */}
          {[-120, -60, 0, 60, 120].map((lon) => {
            const x = ((lon + 180) / 360) * 1000;
            return (
              <line
                key={lon}
                x1={x}
                y1={0}
                x2={x}
                y2={500}
                stroke="rgba(158,241,233,0.10)"
                strokeWidth="1"
              />
            );
          })}
          {[-60, -30, 0, 30, 60].map((lat) => {
            const y = ((90 - lat) / 180) * 500;
            return (
              <line
                key={lat}
                x1={0}
                y1={y}
                x2={1000}
                y2={y}
                stroke="rgba(158,241,233,0.10)"
                strokeWidth="1"
              />
            );
          })}

          {/* Simplified Continent Paths */}
          <g fill="#1E645D" stroke="#4FD1C5" strokeOpacity="0.4" strokeWidth="1.2">
            {/* North America */}
            <path d="M50,65 L140,55 L260,68 L345,105 L285,155 L245,175 L220,210 L268,230 L248,242 L205,212 L160,185 L125,130 L60,105 Z" />
            {/* Greenland */}
            <path d="M350,25 L435,38 L390,95 L340,68 Z" />
            {/* South America */}
            <path d="M268,245 L335,260 L398,305 L368,385 L310,435 L292,420 L278,340 L255,275 Z" />
            {/* Europe */}
            <path d="M475,70 L565,55 L585,95 L575,138 L535,148 L480,145 L465,115 Z" />
            {/* Africa */}
            <path d="M468,162 L545,155 L588,185 L622,225 L572,330 L535,355 L515,300 L488,248 L452,215 Z" />
            {/* Asia */}
            <path d="M582,62 L780,52 L920,88 L885,165 L830,190 L795,245 L750,235 L710,210 L655,200 L615,170 L585,135 Z" />
            {/* Australia & NZ */}
            <path d="M815,285 L905,295 L920,355 L860,375 L805,345 Z" />
            <path d="M950,355 L978,370 L958,405 L940,390 Z" />
            {/* Antarctica */}
            <path d="M120,460 L350,445 L620,448 L880,455 L940,485 L80,485 Z" fill="#6BB6B0" />
          </g>
        </svg>

        {/* Interactive Pins */}
        {destinations.map((dest) => {
          const { x, y } = projectToPercent(dest.coordinates.lat, dest.coordinates.lng);
          const isSelected = activeDest?.id === dest.id;
          return (
            <button
              key={dest.id}
              type="button"
              onClick={() => setActiveId(dest.id)}
              aria-label={`Select ${dest.name}, ${dest.country}`}
              style={{ left: `${x}%`, top: `${y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-full ${
                isSelected ? 'z-20 scale-115' : 'z-10 hover:scale-110'
              }`}
            >
              <span
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold shadow-md whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#FF7043] text-white ring-2 ring-white'
                    : dest.isHiddenGem
                    ? 'bg-[#006A64] text-[#FCF9F3] border border-[#9EF1E9]/40'
                    : 'bg-[#172B3A]/90 text-white border border-white/25'
                }`}
              >
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="hidden sm:inline">{dest.name}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Map Pin Preview Card */}
      {activeDest && (
        <div className="bg-white rounded-2xl border border-[#172B3A]/10 p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shadow-xs">
          <div className="sm:w-44 aspect-[16/10] rounded-xl overflow-hidden shrink-0">
            <SafeImage
              src={activeDest.heroImage}
              alt={`${activeDest.name}, ${activeDest.country}`}
              fallbackTitle={activeDest.name}
              className="w-full h-full"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-[#172B3A]/60">
              <span>
                {activeDest.country} · {activeDest.continent} · {activeDest.category}
              </span>
              <span className="inline-flex items-center gap-1 text-[#172B3A] font-medium tabular-nums">
                <Star className="w-3.5 h-3.5 text-[#FF7043] fill-[#FF7043]" />
                {activeDest.rating.toFixed(1)}
              </span>
            </div>
            <h3 className="font-display text-xl font-bold text-[#172B3A] mt-0.5">
              {activeDest.name}
            </h3>
            <p className="text-sm text-[#172B3A]/70 line-clamp-2 mt-1">{activeDest.tagline}</p>
          </div>
          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
            <span className="text-sm font-semibold text-[#006A64] tabular-nums">
              Est. {formatCurrency(activeDest.dailyBudgetUsd, profile.currency)}/day
            </span>
            <Link
              to={`/destination/${activeDest.id}`}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#172B3A] text-white text-xs sm:text-sm font-semibold hover:bg-[#080C10] inline-flex items-center gap-1.5 transition-colors"
            >
              <span>View Details</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
