export type Continent =
  | 'Asia'
  | 'Europe'
  | 'North America'
  | 'South America'
  | 'Africa'
  | 'Oceania'
  | 'Antarctica';

export type DestinationCategory =
  | 'Mountains'
  | 'Beaches'
  | 'Nature'
  | 'Adventure'
  | 'Culture'
  | 'Historical Places'
  | 'Wildlife'
  | 'City Escapes';

export type BudgetTier = 'all' | 'budget' | 'mid' | 'luxury';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD';

export interface ReviewItem {
  id: string;
  author: string;
  origin: string;
  rating: number;
  date: string;
  comment: string;
}

export interface AccommodationSuggestion {
  tier: 'Boutique' | 'Mid-Range' | 'Luxury';
  name: string;
  neighborhood: string;
  estimatedPerNight: number;
  note: string;
}

export interface DestinationActivity {
  id: string;
  title: string;
  timeOfDay: 'Morning' | 'Afternoon' | 'Evening';
  duration: string;
  estimatedCost: number;
  description: string;
}

export interface Destination {
  id: string;
  name: string;
  city: string;
  country: string;
  continent: Continent;
  category: DestinationCategory;
  secondaryCategories: DestinationCategory[];
  tagline: string;
  description: string;
  heroImage: string;
  galleryImages: string[];
  rating: number;
  reviewCount: number;
  dailyBudgetUsd: number;
  bestSeason: string;
  recommendedDuration: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  soloFriendly: boolean;
  directFlight: boolean;
  isHiddenGem: boolean;
  isTrending: boolean;
  popularAttractions: string[];
  localExperiences: string[];
  activities: DestinationActivity[];
  accommodations: AccommodationSuggestion[];
  travelTips: string[];
  reviews: ReviewItem[];
}

export type TimeSlot = 'Morning' | 'Afternoon' | 'Evening';

export interface ItineraryActivity {
  id: string;
  timeSlot: TimeSlot;
  title: string;
  notes?: string;
  estimatedCostUsd: number;
  duration?: string;
}

export interface TripDay {
  dayNumber: number;
  label: string;
  activities: ItineraryActivity[];
}

export type TripPace = 'Relaxed' | 'Balanced' | 'Action-Packed';

export interface TripPlan {
  id: string;
  title: string;
  destinationId: string;
  departureDate: string;
  returnDate: string;
  travelers: number;
  targetBudgetUsd: number;
  pace: TripPace;
  preferences: DestinationCategory[];
  accommodationName: string;
  accommodationPerNightUsd: number;
  transportationMode: string;
  transportationCostUsd: number;
  days: TripDay[];
  status: 'upcoming' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  name: string;
  email: string;
  homeCity: string;
  bio: string;
  avatarUrl: string;
  countriesExplored: number;
  preferredCategories: DestinationCategory[];
  currency: CurrencyCode;
  notifications: {
    tripReminders: boolean;
    hiddenGems: boolean;
    seasonalGuides: boolean;
  };
  isSignedIn: boolean;
}

export interface TravelNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  destinationId?: string;
}
