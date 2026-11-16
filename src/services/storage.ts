import {
  CurrencyCode,
  TravelNotification,
  TripPlan,
  UserProfile,
} from '../types';
import { IMG } from '../data/destinations';

const KEYS = {
  BOOKMARKS: 'roamly_bookmarks_v1',
  TRIPS: 'roamly_trips_v1',
  PROFILE: 'roamly_profile_v1',
  NOTIFICATIONS: 'roamly_notifications_v1',
};

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Elena Vance',
  email: 'elena.vance@roamly.travel',
  homeCity: 'San Francisco, USA',
  bio: 'Slow traveler chasing dawn mountain passes, architectural courtyards, and coastal trails.',
  avatarUrl: IMG.avatar,
  countriesExplored: 14,
  preferredCategories: ['Mountains', 'Culture', 'Nature', 'Beaches'],
  currency: 'USD',
  notifications: {
    tripReminders: true,
    hiddenGems: true,
    seasonalGuides: false,
  },
  isSignedIn: false,
};

export const SEED_TRIPS: TripPlan[] = [
  {
    id: 'trip-kyoto-autumn',
    title: 'Autumn Maple & Temples Escape',
    destinationId: 'kyoto-japan',
    departureDate: '2026-11-28',
    returnDate: '2026-12-02',
    travelers: 2,
    targetBudgetUsd: 2100,
    pace: 'Balanced',
    preferences: ['Culture', 'Nature', 'Historical Places'],
    accommodationName: 'Karasuma Cedar Machiya',
    accommodationPerNightUsd: 145,
    transportationMode: 'Shinkansen + ICOCA Local Rail',
    transportationCostUsd: 240,
    status: 'upcoming',
    createdAt: '2026-10-12T09:00:00Z',
    updatedAt: '2026-11-01T14:20:00Z',
    days: [
      {
        dayNumber: 1,
        label: 'Arrival & Higashiyama Lanes',
        activities: [
          {
            id: 'act-seed-1',
            timeSlot: 'Afternoon',
            title: 'Check into Machiya & Kamo River Walk',
            estimatedCostUsd: 15,
            duration: '2 hrs',
          },
          {
            id: 'act-seed-2',
            timeSlot: 'Evening',
            title: 'Pontocho Alley Lantern Dinner',
            estimatedCostUsd: 65,
            duration: '2 hrs',
          },
        ],
      },
      {
        dayNumber: 2,
        label: 'Arashiyama Bamboo Dawn',
        activities: [
          {
            id: 'act-seed-3',
            timeSlot: 'Morning',
            title: 'Dawn Walk Through Arashiyama & Tenryu-ji',
            estimatedCostUsd: 22,
            duration: '3 hrs',
          },
          {
            id: 'act-seed-4',
            timeSlot: 'Afternoon',
            title: 'Nishiki Market Tasting & Craft Workshop',
            estimatedCostUsd: 48,
            duration: '2.5 hrs',
          },
        ],
      },
      {
        dayNumber: 3,
        label: 'Fushimi Inari & Uji Tea',
        activities: [
          {
            id: 'act-seed-5',
            timeSlot: 'Morning',
            title: 'Fushimi Inari Summit Torii Trail',
            estimatedCostUsd: 0,
            duration: '3 hrs',
          },
          {
            id: 'act-seed-6',
            timeSlot: 'Afternoon',
            title: 'Uji Matcha Pavilion Ceremony',
            estimatedCostUsd: 42,
            duration: '2 hrs',
          },
        ],
      },
    ],
  },
  {
    id: 'trip-santorini-summer',
    title: 'Aegean Caldera Ridge Retreat',
    destinationId: 'santorini-greece',
    departureDate: '2026-06-14',
    returnDate: '2026-06-17',
    travelers: 2,
    targetBudgetUsd: 1850,
    pace: 'Relaxed',
    preferences: ['Beaches', 'Culture'],
    accommodationName: 'Pyrgos White Stone Suites',
    accommodationPerNightUsd: 185,
    transportationMode: 'Ferry & Island Scooter',
    transportationCostUsd: 190,
    status: 'completed',
    createdAt: '2026-05-02T11:00:00Z',
    updatedAt: '2026-06-18T18:00:00Z',
    days: [
      {
        dayNumber: 1,
        label: 'Fira to Oia Footpath',
        activities: [
          {
            id: 'act-seed-7',
            timeSlot: 'Morning',
            title: 'Caldera Rim Morning Hike (Fira to Oia)',
            estimatedCostUsd: 15,
            duration: '3.5 hrs',
          },
          {
            id: 'act-seed-8',
            timeSlot: 'Evening',
            title: 'Amoudi Bay Sunset Catch',
            estimatedCostUsd: 55,
            duration: '2 hrs',
          },
        ],
      },
      {
        dayNumber: 2,
        label: 'Caldera Sail & Pyrgos',
        activities: [
          {
            id: 'act-seed-9',
            timeSlot: 'Afternoon',
            title: 'Volcanic Hot Springs & Caldera Sail',
            estimatedCostUsd: 95,
            duration: '4 hrs',
          },
        ],
      },
    ],
  },
];

export const SEED_NOTIFICATIONS: TravelNotification[] = [
  {
    id: 'notif-1',
    title: 'Peak Autumn Window in Kyoto',
    message: 'Late November maple foliage along Philosopher’s Path is entering peak color.',
    time: '2 hrs ago',
    read: false,
    destinationId: 'kyoto-japan',
  },
  {
    id: 'notif-2',
    title: 'Hidden Gem Pick: Lofoten Islands',
    message: 'Explore Arctic fjords and red fishermen cabins curated for Mountain lovers.',
    time: '1 day ago',
    read: false,
    destinationId: 'lofoten-norway',
  },
  {
    id: 'notif-3',
    title: 'Itinerary Saved',
    message: 'Your Autumn Maple & Temples Escape itinerary is synced locally and ready for editing.',
    time: '3 days ago',
    read: true,
    destinationId: 'kyoto-japan',
  },
];

export const CURRENCY_RATES: Record<CurrencyCode, { symbol: string; rate: number; label: string }> = {
  USD: { symbol: '$', rate: 1, label: 'USD ($)' },
  EUR: { symbol: '€', rate: 0.92, label: 'EUR (€)' },
  GBP: { symbol: '£', rate: 0.79, label: 'GBP (£)' },
  JPY: { symbol: '¥', rate: 152, label: 'JPY (¥)' },
  AUD: { symbol: 'A$', rate: 1.52, label: 'AUD (A$)' },
};

export function formatCurrency(usdAmount: number, currency: CurrencyCode = 'USD'): string {
  const cfg = CURRENCY_RATES[currency] || CURRENCY_RATES.USD;
  const converted = Math.round(usdAmount * cfg.rate);
  return `${cfg.symbol}${converted.toLocaleString()}`;
}

export const storageService = {
  getBookmarks(): string[] {
    try {
      const raw = localStorage.getItem(KEYS.BOOKMARKS);
      if (!raw) {
        const defaults = ['kyoto-japan', 'swiss-alps-zermatt', 'machu-picchu-peru', 'queenstown-nz'];
        localStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(defaults));
        return defaults;
      }
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveBookmarks(ids: string[]): void {
    try {
      localStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(ids));
    } catch {
      // ignore quota errors
    }
  },

  getTrips(): TripPlan[] {
    try {
      const raw = localStorage.getItem(KEYS.TRIPS);
      if (!raw) {
        localStorage.setItem(KEYS.TRIPS, JSON.stringify(SEED_TRIPS));
        return SEED_TRIPS;
      }
      return JSON.parse(raw);
    } catch {
      return SEED_TRIPS;
    }
  },

  saveTrips(trips: TripPlan[]): void {
    try {
      localStorage.setItem(KEYS.TRIPS, JSON.stringify(trips));
    } catch {
      // ignore
    }
  },

  getProfile(): UserProfile {
    try {
      const raw = localStorage.getItem(KEYS.PROFILE);
      if (!raw) {
        localStorage.setItem(KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
        return DEFAULT_PROFILE;
      }
      return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
    } catch {
      // ignore
    }
  },

  getNotifications(): TravelNotification[] {
    try {
      const raw = localStorage.getItem(KEYS.NOTIFICATIONS);
      if (!raw) {
        localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(SEED_NOTIFICATIONS));
        return SEED_NOTIFICATIONS;
      }
      return JSON.parse(raw);
    } catch {
      return SEED_NOTIFICATIONS;
    }
  },

  saveNotifications(items: TravelNotification[]): void {
    try {
      localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(items));
    } catch {
      // ignore
    }
  },
};
