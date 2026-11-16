import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  CurrencyCode,
  DestinationCategory,
  TravelNotification,
  TripPlan,
  UserProfile,
} from '../types';
import { storageService } from '../services/storage';

export interface ToastMessage {
  id: string;
  text: string;
  tone?: 'default' | 'success' | 'warning';
}

interface RoamlyContextValue {
  bookmarks: string[];
  toggleBookmark: (destinationId: string, name?: string) => void;
  isBookmarked: (destinationId: string) => boolean;

  trips: TripPlan[];
  saveTrip: (trip: TripPlan) => void;
  deleteTrip: (tripId: string) => void;
  toggleTripStatus: (tripId: string) => void;

  profile: UserProfile;
  updateProfile: (patch: Partial<UserProfile>) => void;
  togglePreferredCategory: (cat: DestinationCategory) => void;
  setCurrency: (currency: CurrencyCode) => void;
  signIn: (name: string, email: string) => void;
  signOut: () => void;

  notifications: TravelNotification[];
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;

  toasts: ToastMessage[];
  showToast: (text: string, tone?: 'default' | 'success' | 'warning') => void;
}

const RoamlyContext = createContext<RoamlyContextValue | undefined>(undefined);

export function RoamlyProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<string[]>(() => storageService.getBookmarks());
  const [trips, setTrips] = useState<TripPlan[]>(() => storageService.getTrips());
  const [profile, setProfile] = useState<UserProfile>(() => storageService.getProfile());
  const [notifications, setNotifications] = useState<TravelNotification[]>(() =>
    storageService.getNotifications(),
  );
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (text: string, tone: 'default' | 'success' | 'warning' = 'default') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-2), { id, text, tone }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3200);
    },
    [],
  );

  useEffect(() => {
    storageService.saveBookmarks(bookmarks);
  }, [bookmarks]);

  useEffect(() => {
    storageService.saveTrips(trips);
  }, [trips]);

  useEffect(() => {
    storageService.saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    storageService.saveNotifications(notifications);
  }, [notifications]);

  const toggleBookmark = useCallback(
    (destinationId: string, name?: string) => {
      setBookmarks((prev) => {
        const exists = prev.includes(destinationId);
        const next = exists
          ? prev.filter((id) => id !== destinationId)
          : [destinationId, ...prev];
        showToast(
          exists
            ? `Removed ${name || 'destination'} from wishlist`
            : `Saved ${name || 'destination'} to wishlist`,
          exists ? 'default' : 'success',
        );
        return next;
      });
    },
    [showToast],
  );

  const isBookmarked = useCallback(
    (destinationId: string) => bookmarks.includes(destinationId),
    [bookmarks],
  );

  const saveTrip = useCallback(
    (trip: TripPlan) => {
      setTrips((prev) => {
        const idx = prev.findIndex((t) => t.id === trip.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = { ...trip, updatedAt: new Date().toISOString() };
          return copy;
        }
        return [trip, ...prev];
      });
      showToast(`Itinerary "${trip.title}" saved`, 'success');
    },
    [showToast],
  );

  const deleteTrip = useCallback(
    (tripId: string) => {
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
      showToast('Trip deleted from your itineraries', 'default');
    },
    [showToast],
  );

  const toggleTripStatus = useCallback(
    (tripId: string) => {
      setTrips((prev) =>
        prev.map((t) =>
          t.id === tripId
            ? { ...t, status: t.status === 'upcoming' ? 'completed' : 'upcoming' }
            : t,
        ),
      );
      showToast('Trip status updated', 'success');
    },
    [showToast],
  );

  const updateProfile = useCallback(
    (patch: Partial<UserProfile>) => {
      setProfile((prev) => ({ ...prev, ...patch }));
      showToast('Profile preferences updated', 'success');
    },
    [showToast],
  );

  const togglePreferredCategory = useCallback((cat: DestinationCategory) => {
    setProfile((prev) => {
      const exists = prev.preferredCategories.includes(cat);
      const next = exists
        ? prev.preferredCategories.filter((c) => c !== cat)
        : [...prev.preferredCategories, cat];
      return { ...prev, preferredCategories: next };
    });
  }, []);

  const setCurrency = useCallback(
    (currency: CurrencyCode) => {
      setProfile((prev) => ({ ...prev, currency }));
      showToast(`Currency updated to ${currency}`, 'default');
    },
    [showToast],
  );

  const signIn = useCallback(
    (name: string, email: string) => {
      setProfile((prev) => ({
        ...prev,
        name: name.trim() || prev.name,
        email: email.trim() || prev.email,
        isSignedIn: true,
      }));
      setAuthModalOpen(false);
      showToast(`Welcome back, ${name.trim() || profile.name}`, 'success');
    },
    [profile.name, showToast],
  );

  const signOut = useCallback(() => {
    setProfile((prev) => ({ ...prev, isSignedIn: false }));
    showToast('Signed out of ROAMLY session', 'default');
  }, [showToast]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <RoamlyContext.Provider
      value={{
        bookmarks,
        toggleBookmark,
        isBookmarked,
        trips,
        saveTrip,
        deleteTrip,
        toggleTripStatus,
        profile,
        updateProfile,
        togglePreferredCategory,
        setCurrency,
        signIn,
        signOut,
        notifications,
        unreadCount,
        markNotificationRead,
        markAllNotificationsRead,
        authModalOpen,
        setAuthModalOpen,
        toasts,
        showToast,
      }}
    >
      {children}
    </RoamlyContext.Provider>
  );
}

export function useRoamly() {
  const ctx = useContext(RoamlyContext);
  if (!ctx) throw new Error('useRoamly must be used inside RoamlyProvider');
  return ctx;
}
