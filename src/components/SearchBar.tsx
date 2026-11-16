import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Search, X } from 'lucide-react';
import { destinationService } from '../services/destinationService';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showInstantDropdown?: boolean;
  onSubmit?: () => void;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search Kyoto, Patagonia, beaches, mountains...',
  showInstantDropdown = false,
  onSubmit,
}: SearchBarProps) {
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();

  const suggestions = useMemo(() => {
    if (!showInstantDropdown || !value.trim()) return [];
    return destinationService.filter({ query: value }).slice(0, 5);
  }, [showInstantDropdown, value]);

  return (
    <div className="relative w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setFocused(false);
          if (onSubmit) {
            onSubmit();
          } else if (value.trim()) {
            navigate(`/explore?q=${encodeURIComponent(value.trim())}`);
          }
        }}
        className="relative flex items-center"
      >
        <Search
          className="w-4.5 h-4.5 text-[#172B3A]/50 absolute left-4 pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 180)}
          placeholder={placeholder}
          aria-label="Search destinations, countries, or cities"
          className="w-full h-12 pl-11 pr-12 rounded-2xl bg-white border border-[#172B3A]/12 text-sm text-[#172B3A] placeholder:text-[#172B3A]/45 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#FF7043] focus:border-transparent transition-shadow"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Clear search"
            className="absolute right-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full text-[#172B3A]/50 hover:text-[#172B3A]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {showInstantDropdown && focused && value.trim().length > 0 && (
        <div
          role="listbox"
          className="absolute left-0 right-0 mt-2 bg-white rounded-2xl border border-[#172B3A]/12 shadow-lg overflow-hidden z-30"
        >
          {suggestions.length > 0 ? (
            <ul>
              {suggestions.map((dest) => (
                <li key={dest.id}>
                  <button
                    type="button"
                    onMouseDown={() => navigate(`/destination/${dest.id}`)}
                    className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-[#FCF9F3] transition-colors border-b border-[#172B3A]/6 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#172B3A] truncate">
                        {dest.name}
                      </p>
                      <p className="text-xs text-[#172B3A]/60 truncate">
                        {dest.country} · {dest.continent} · {dest.category}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#FF7043] shrink-0" />
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onMouseDown={() => navigate(`/explore?q=${encodeURIComponent(value.trim())}`)}
                  className="w-full px-4 py-2.5 text-xs font-semibold text-[#006A64] bg-[#FCF9F3] hover:bg-[#9EF1E9]/25 text-left"
                >
                  See all results for “{value.trim()}” in Explore →
                </button>
              </li>
            </ul>
          ) : (
            <div className="px-4 py-4 text-sm text-[#172B3A]/65">
              No matching places found for “{value.trim()}”. Try another country or category.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
