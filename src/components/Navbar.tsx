import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Bell, Compass } from 'lucide-react';
import { useRoamly } from '../context/RoamlyContext';
import { SafeImage } from './SafeImage';

interface NavbarProps {
  onOpenNotifications: () => void;
}

const NAV_LINKS = [
  { to: '/discover', label: 'Discover' },
  { to: '/explore', label: 'Explore' },
  { to: '/planner', label: 'Trips' },
  { to: '/saved', label: 'Saved' },
  { to: '/profile', label: 'Profile' },
];

export function Navbar({ onOpenNotifications }: NavbarProps) {
  const { profile, unreadCount, setAuthModalOpen } = useRoamly();

  return (
    <header className="sticky top-0 z-30 bg-[#FCF9F3]/95 backdrop-blur-md border-b border-[#172B3A]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-13 md:h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <Link
          to="/discover"
          className="inline-flex items-center gap-2 font-display text-lg md:text-xl font-bold tracking-tight text-[#172B3A] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7043] rounded-lg px-1"
        >
          <Compass className="w-5 h-5 text-[#FF7043]" aria-hidden="true" />
          <span>ROAMLY</span>
        </Link>

        {/* Zone 2: 5 single-line desktop nav links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium" aria-label="Primary navigation">
          {NAV_LINKS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors duration-150 ${
                  isActive
                    ? 'text-[#172B3A] border-[#FF7043] font-semibold'
                    : 'text-[#172B3A]/65 border-transparent hover:text-[#172B3A]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Zone 3: Primary action cluster (Notifications + Auth/Profile) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenNotifications}
            aria-label={`Travel notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
            className="relative min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-[#172B3A] hover:bg-[#172B3A]/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7043]"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-[#FF7043] text-white text-[10px] font-semibold flex items-center justify-center tabular-nums">
                {unreadCount}
              </span>
            )}
          </button>

          {profile.isSignedIn ? (
            <Link
              to="/profile"
              aria-label="Open traveler profile"
              className="min-h-[44px] flex items-center gap-2.5 pl-1 pr-2 rounded-full hover:bg-[#172B3A]/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7043]"
            >
              <SafeImage
                src={profile.avatarUrl}
                alt={profile.name}
                fallbackTitle={profile.name.slice(0, 2)}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-[#172B3A]/15"
              />
              <span className="hidden lg:inline text-sm font-medium text-[#172B3A] whitespace-nowrap">
                {profile.name.split(' ')[0]}
              </span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="min-h-[40px] px-4 py-2 rounded-full bg-[#172B3A] text-white text-xs sm:text-sm font-medium hover:bg-[#080C10] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7043]"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
