import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  Edit3,
  Globe2,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  Wallet,
} from 'lucide-react';
import { CATEGORIES } from '../data/destinations';
import { CURRENCY_RATES } from '../services/storage';
import { useRoamly } from '../context/RoamlyContext';
import { CurrencyCode } from '../types';
import { SafeImage } from '../components/SafeImage';

export function Profile() {
  const navigate = useNavigate();
  const {
    profile,
    updateProfile,
    togglePreferredCategory,
    setCurrency,
    signOut,
    setAuthModalOpen,
    bookmarks,
    trips,
  } = useRoamly();

  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);
  const [emailInput, setEmailInput] = useState(profile.email);
  const [cityInput, setCityInput] = useState(profile.homeCity);
  const [bioInput, setBioInput] = useState(profile.bio);
  const [countriesInput, setCountriesInput] = useState(String(profile.countriesExplored));

  const completedCount = trips.filter((t) => t.status === 'completed').length;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: nameInput.trim() || profile.name,
      email: emailInput.trim() || profile.email,
      homeCity: cityInput.trim() || profile.homeCity,
      bio: bioInput.trim(),
      countriesExplored: Math.max(0, Number(countriesInput) || 0),
    });
    setEditing(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 md:pb-16 space-y-8">
      {/* Top Traveler Identity Card */}
      <section className="bg-white rounded-3xl border border-[#172B3A]/10 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <SafeImage
              src={profile.avatarUrl}
              alt={profile.name}
              fallbackTitle={profile.name.slice(0, 2)}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-2 ring-[#FF7043]/40 shrink-0"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#006A64] font-semibold">
                <span>{profile.isSignedIn ? 'Signed-in Traveler' : 'Guest Explorer'}</span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 text-[#172B3A]/65 font-normal">
                  <MapPin className="w-3.5 h-3.5" />
                  {profile.homeCity}
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#172B3A] mt-0.5 truncate">
                {profile.name}
              </h1>
              <p className="text-xs sm:text-sm text-[#172B3A]/65 inline-flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                {profile.email}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setNameInput(profile.name);
                setEmailInput(profile.email);
                setCityInput(profile.homeCity);
                setBioInput(profile.bio);
                setCountriesInput(String(profile.countriesExplored));
                setEditing((v) => !v);
              }}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-[#172B3A]/15 text-xs sm:text-sm font-semibold text-[#172B3A] hover:bg-[#FCF9F3] inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>{editing ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>

            {profile.isSignedIn ? (
              <button
                type="button"
                onClick={() => {
                  signOut();
                  navigate('/');
                }}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-[#172B3A] hover:bg-[#080C10] text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-[#FF7043] hover:bg-[#e85d31] text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        <p className="mt-4 text-sm text-[#172B3A]/80 leading-relaxed max-w-2xl">
          {profile.bio}
        </p>

        {/* Inline Edit Profile Form */}
        {editing && (
          <form
            onSubmit={handleSaveProfile}
            className="mt-6 pt-6 border-t border-[#172B3A]/10 grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <div>
              <label htmlFor="prof-name" className="block text-xs font-medium text-[#172B3A]/70 mb-1">
                Name
              </label>
              <input
                id="prof-name"
                type="text"
                required
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-[#FCF9F3] border border-[#172B3A]/15 text-sm"
              />
            </div>
            <div>
              <label htmlFor="prof-email" className="block text-xs font-medium text-[#172B3A]/70 mb-1">
                Email
              </label>
              <input
                id="prof-email"
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-[#FCF9F3] border border-[#172B3A]/15 text-sm"
              />
            </div>
            <div>
              <label htmlFor="prof-city" className="block text-xs font-medium text-[#172B3A]/70 mb-1">
                Home City
              </label>
              <input
                id="prof-city"
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-[#FCF9F3] border border-[#172B3A]/15 text-sm"
              />
            </div>
            <div>
              <label htmlFor="prof-countries" className="block text-xs font-medium text-[#172B3A]/70 mb-1">
                Countries Explored
              </label>
              <input
                id="prof-countries"
                type="number"
                min={0}
                max={195}
                value={countriesInput}
                onChange={(e) => setCountriesInput(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-[#FCF9F3] border border-[#172B3A]/15 text-sm tabular-nums"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="prof-bio" className="block text-xs font-medium text-[#172B3A]/70 mb-1">
                Travel Bio
              </label>
              <textarea
                id="prof-bio"
                rows={2}
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-[#FCF9F3] border border-[#172B3A]/15 text-sm"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="min-h-[42px] px-4 py-2 rounded-xl border border-[#172B3A]/15 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-[42px] px-5 py-2 rounded-xl bg-[#FF7043] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Travel Statistics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#172B3A]/10 p-5">
          <p className="text-xs text-[#172B3A]/60">Countries Explored</p>
          <p className="font-display text-3xl font-bold text-[#172B3A] mt-1 tabular-nums">
            {profile.countriesExplored}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-[#172B3A]/10 p-5">
          <p className="text-xs text-[#172B3A]/60">Destinations Saved</p>
          <p className="font-display text-3xl font-bold text-[#FF7043] mt-1 tabular-nums">
            {bookmarks.length}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-[#172B3A]/10 p-5">
          <p className="text-xs text-[#172B3A]/60">Trips Planned</p>
          <p className="font-display text-3xl font-bold text-[#006A64] mt-1 tabular-nums">
            {trips.length}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-[#172B3A]/10 p-5">
          <p className="text-xs text-[#172B3A]/60">Completed Trips</p>
          <p className="font-display text-3xl font-bold text-[#172B3A] mt-1 tabular-nums">
            {completedCount}
          </p>
        </div>
      </section>

      {/* Travel Preferences & Currency */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#172B3A]/10 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-[#006A64]" />
            <h2 className="font-display text-xl font-bold text-[#172B3A]">
              Preferred Travel Categories
            </h2>
          </div>
          <p className="text-xs text-[#172B3A]/65">
            Select your favorite styles to personalize “Made for You” picks on Discover.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {CATEGORIES.map((cat) => {
              const selected = profile.preferredCategories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => togglePreferredCategory(cat)}
                  aria-pressed={selected}
                  className={`min-h-[42px] px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                    selected
                      ? 'bg-[#006A64] text-white'
                      : 'bg-[#FCF9F3] text-[#172B3A]/75 border border-[#172B3A]/12 hover:border-[#172B3A]/30'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          {/* Currency Selector */}
          <div className="bg-white rounded-3xl border border-[#172B3A]/10 p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-[#FF7043]" />
              <h2 className="font-display text-xl font-bold text-[#172B3A]">
                Currency Preference
              </h2>
            </div>
            <p className="text-xs text-[#172B3A]/65">
              Converts estimated daily budgets and itinerary totals across the app.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {(Object.keys(CURRENCY_RATES) as CurrencyCode[]).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setCurrency(code)}
                  className={`min-h-[42px] px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                    profile.currency === code
                      ? 'bg-[#172B3A] text-white border-[#172B3A]'
                      : 'bg-[#FCF9F3] text-[#172B3A] border-[#172B3A]/12 hover:border-[#172B3A]/30'
                  }`}
                >
                  {CURRENCY_RATES[code].label}
                </button>
              ))}
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-3xl border border-[#172B3A]/10 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#006A64]" />
              <h2 className="font-display text-xl font-bold text-[#172B3A]">
                Notification Settings
              </h2>
            </div>

            <div className="space-y-3">
              {(
                [
                  {
                    key: 'tripReminders',
                    label: 'Upcoming Trip Reminders',
                    desc: 'Alerts before planned departure dates',
                  },
                  {
                    key: 'hiddenGems',
                    label: 'Hidden Gem Spotlights',
                    desc: 'Curated off-the-beaten-path updates',
                  },
                  {
                    key: 'seasonalGuides',
                    label: 'Seasonal Travel Windows',
                    desc: 'Best weather & foliage alerts',
                  },
                ] as const
              ).map((item) => {
                const enabled = profile.notifications[item.key];
                return (
                  <label
                    key={item.key}
                    className="flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#172B3A]">{item.label}</p>
                      <p className="text-xs text-[#172B3A]/60">{item.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={() =>
                        updateProfile({
                          notifications: {
                            ...profile.notifications,
                            [item.key]: !enabled,
                          },
                        })
                      }
                      className="w-5 h-5 accent-[#FF7043] rounded cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
