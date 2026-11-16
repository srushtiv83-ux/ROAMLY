import { DESTINATIONS } from '../data/destinations';
import {
  BudgetTier,
  Continent,
  Destination,
  DestinationCategory,
} from '../types';

export interface DestinationFilters {
  query?: string;
  continent?: Continent | 'All';
  category?: DestinationCategory | 'All';
  budgetTier?: BudgetTier;
  soloFriendlyOnly?: boolean;
  directFlightOnly?: boolean;
  hiddenGemsOnly?: boolean;
}

export const destinationService = {
  getAll(): Destination[] {
    return DESTINATIONS;
  },

  getById(id: string): Destination | undefined {
    return DESTINATIONS.find((d) => d.id === id);
  },

  filter(filters: DestinationFilters): Destination[] {
    const q = (filters.query || '').trim().toLowerCase();

    return DESTINATIONS.filter((dest) => {
      if (q) {
        const haystack = [
          dest.name,
          dest.city,
          dest.country,
          dest.continent,
          dest.category,
          dest.tagline,
          ...dest.popularAttractions,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      if (filters.continent && filters.continent !== 'All') {
        if (dest.continent !== filters.continent) return false;
      }

      if (filters.category && filters.category !== 'All') {
        const matchesPrimary = dest.category === filters.category;
        const matchesSecondary = dest.secondaryCategories.includes(filters.category);
        if (!matchesPrimary && !matchesSecondary) return false;
      }

      if (filters.budgetTier && filters.budgetTier !== 'all') {
        if (filters.budgetTier === 'budget' && dest.dailyBudgetUsd >= 110) return false;
        if (
          filters.budgetTier === 'mid' &&
          (dest.dailyBudgetUsd < 110 || dest.dailyBudgetUsd > 220)
        ) {
          return false;
        }
        if (filters.budgetTier === 'luxury' && dest.dailyBudgetUsd <= 220) return false;
      }

      if (filters.soloFriendlyOnly && !dest.soloFriendly) return false;
      if (filters.directFlightOnly && !dest.directFlight) return false;
      if (filters.hiddenGemsOnly && !dest.isHiddenGem) return false;

      return true;
    });
  },

  getTrending(): Destination[] {
    return DESTINATIONS.filter((d) => d.isTrending);
  },

  getHiddenGems(): Destination[] {
    return DESTINATIONS.filter((d) => d.isHiddenGem);
  },

  getRecommendedForCategories(categories: DestinationCategory[]): Destination[] {
    if (!categories.length) return DESTINATIONS.slice(0, 6);
    const scored = DESTINATIONS.map((dest) => {
      let score = 0;
      if (categories.includes(dest.category)) score += 3;
      dest.secondaryCategories.forEach((sc) => {
        if (categories.includes(sc)) score += 1;
      });
      return { dest, score };
    })
      .sort((a, b) => b.score - a.score || b.dest.rating - a.dest.rating)
      .map((item) => item.dest);
    return scored.slice(0, 8);
  },
};
