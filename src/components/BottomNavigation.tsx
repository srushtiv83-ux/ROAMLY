import React from 'react';
import { NavLink } from 'react-router-dom';
import { Bookmark, Compass, Globe2, Map, User } from 'lucide-react';

const TABS = [
  { to: '/discover', label: 'Discover', icon: Globe2 },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/planner', label: 'Trips', icon: Map },
  { to: '/saved', label: 'Saved', icon: Bookmark },
  { to: '/profile', label: 'Profile', icon: User },
];

export function BottomNavigation() {
  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FCF9F3]/95 backdrop-blur-md border-t border-[#172B3A]/10"
    >
      <div className="grid grid-cols-5 items-center h-14 px-1">
        {TABS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition-colors duration-150 ${
                isActive ? 'text-[#FF7043]' : 'text-[#172B3A]/60 hover:text-[#172B3A]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.3 : 1.8} />
                <span className="text-[10px] font-medium tracking-tight leading-none whitespace-nowrap">
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
