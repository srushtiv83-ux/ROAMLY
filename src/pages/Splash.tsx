import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Compass, Globe2, LogIn } from 'lucide-react';
import { CONTINENTS, IMG } from '../data/destinations';
import { useRoamly } from '../context/RoamlyContext';
import { SafeImage } from '../components/SafeImage';

export function Splash() {
  const navigate = useNavigate();
  const { profile, setAuthModalOpen } = useRoamly();
  const [exiting, setExiting] = useState(false);

  const handleExplore = (target = '/discover') => {
    setExiting(true);
    window.setTimeout(() => {
      navigate(target);
    }, 220);
  };

  return (
    <div
      className={`relative min-h-screen w-full bg-[#080C10] text-white flex flex-col justify-between overflow-hidden transition-opacity duration-300 ${
        exiting ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Full-bleed atmospheric background */}
      <div className="absolute inset-0 z-0">
        <SafeImage
          src={IMG.splash}
          alt="Dramatic coastal cliffs at twilight"
          className="w-full h-full scale-[1.02]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-[#080C10]/75 via-[#080C10]/45 to-[#080C10]/95"
        />
      </div>

      {/* Top minimal bar */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-5 sm:px-8 pt-6 flex items-center justify-between">
        <div className="inline-flex items-center gap-2.5">
          <Compass className="w-6 h-6 text-[#FF7043]" aria-hidden="true" />
          <span className="font-display text-xl font-bold tracking-wider">ROAMLY</span>
        </div>

        <button
          type="button"
          onClick={() => {
            if (profile.isSignedIn) {
              handleExplore('/discover');
            } else {
              setAuthModalOpen(true);
            }
          }}
          className="min-h-[44px] px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs sm:text-sm font-medium text-white backdrop-blur-md inline-flex items-center gap-2 transition-colors cursor-pointer"
        >
          <LogIn className="w-4 h-4 text-[#9EF1E9]" />
          <span>{profile.isSignedIn ? `Continue as ${profile.name.split(' ')[0]}` : 'Sign In'}</span>
        </button>
      </header>

      {/* Center Editorial Hero */}
      <main className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 py-12 flex flex-col items-center text-center">
        {/* Animated Compass Emblem */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 mb-7 flex items-center justify-center">
          <svg
            viewBox="0 0 120 120"
            className="w-full h-full animate-compass-slow text-[#9EF1E9]/65"
            aria-hidden="true"
          >
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeDasharray="4 6"
            />
            <circle cx="60" cy="60" r="44" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
            <path d="M60 4 L60 14 M60 106 L60 116 M4 60 L14 60 M106 60 L116 60" stroke="#FF7043" strokeWidth="2" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-[#172B3A]/85 border border-[#9EF1E9]/40 flex items-center justify-center shadow-lg">
              <Globe2 className="w-7 h-7 text-[#FF7043]" />
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm font-medium tracking-[0.22em] uppercase text-[#9EF1E9] mb-3">
          One World · Endless Possibilities
        </p>

        <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.06]">
          Find Places. Feel Stories.
        </h1>

        <p className="mt-5 max-w-xl text-sm sm:text-base text-white/80 leading-relaxed">
          Discover curated destinations across all seven continents, spin our interactive 3D globe for hidden gems, and craft day-by-day travel itineraries built for the way you roam.
        </p>

        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handleExplore('/discover')}
            className="w-full sm:w-auto min-h-[50px] px-8 py-3.5 rounded-full bg-[#FF7043] hover:bg-[#e85d31] text-white font-display font-semibold text-base shadow-lg shadow-[#FF7043]/25 inline-flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] cursor-pointer"
          >
            <span>Explore the World</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => {
              if (profile.isSignedIn) {
                handleExplore('/planner');
              } else {
                setAuthModalOpen(true);
              }
            }}
            className="w-full sm:w-auto min-h-[50px] px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/25 text-white font-medium text-sm sm:text-base backdrop-blur-md transition-colors cursor-pointer"
          >
            {profile.isSignedIn ? 'Open Trip Planner' : 'Sign In to Sync Trips'}
          </button>
        </div>
      </main>

      {/* Bottom 7-Continent Editorial Strip */}
      <footer className="relative z-10 max-w-6xl w-full mx-auto px-5 sm:px-8 pb-8">
        <div className="border-t border-white/15 pt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/70">
          {CONTINENTS.filter((c) => c.id !== 'All').map((cont) => (
            <button
              key={cont.id}
              type="button"
              onClick={() => handleExplore(`/explore?continent=${encodeURIComponent(cont.id)}`)}
              className="hover:text-[#9EF1E9] transition-colors py-1 cursor-pointer"
            >
              {cont.label}
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
}
