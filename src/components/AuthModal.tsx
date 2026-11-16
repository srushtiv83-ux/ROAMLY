import React, { useState } from 'react';
import { Compass, X } from 'lucide-react';
import { useRoamly } from '../context/RoamlyContext';

export function AuthModal() {
  const { authModalOpen, setAuthModalOpen, profile, signIn } = useRoamly();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);

  if (!authModalOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 bg-[#080C10]/65 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="relative w-full max-w-md bg-[#FCF9F3] rounded-3xl border border-[#172B3A]/12 p-6 sm:p-8 shadow-2xl">
        <button
          type="button"
          onClick={() => setAuthModalOpen(false)}
          aria-label="Close sign in dialog"
          className="absolute top-4 right-4 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-[#172B3A]/60 hover:bg-[#172B3A]/5"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <Compass className="w-6 h-6 text-[#FF7043]" />
          <span className="font-display text-lg font-bold tracking-tight text-[#172B3A]">
            ROAMLY
          </span>
        </div>

        <h2 id="auth-modal-title" className="font-display text-2xl font-bold text-[#172B3A]">
          Sign in to your travel journal
        </h2>
        <p className="mt-1.5 text-sm text-[#172B3A]/70">
          Sync your saved destinations, custom itineraries, and currency preferences locally across sessions.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            signIn(name, email);
          }}
          className="mt-6 space-y-4"
        >
          <div>
            <label htmlFor="auth-name" className="block text-xs font-medium text-[#172B3A]/75 mb-1.5">
              Full Name
            </label>
            <input
              id="auth-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#172B3A]/15 text-sm text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#FF7043]"
            />
          </div>

          <div>
            <label htmlFor="auth-email" className="block text-xs font-medium text-[#172B3A]/75 mb-1.5">
              Email Address
            </label>
            <input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#172B3A]/15 text-sm text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#FF7043]"
            />
          </div>

          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-[#FF7043] text-white font-semibold text-sm hover:bg-[#e85d31] transition-colors cursor-pointer"
          >
            Continue to ROAMLY
          </button>
        </form>
      </div>
    </div>
  );
}
