import { useMemo } from 'react';
import { useRoamly } from '../context/RoamlyContext';
import { TripPlan } from '../types';

export function calculateTripTotalUsd(trip: TripPlan): number {
  const start = new Date(trip.departureDate);
  const end = new Date(trip.returnDate);
  const diffDays = Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
  );
  const nights = Math.max(1, diffDays - 1);
  const lodging = nights * trip.accommodationPerNightUsd;
  const activitiesTotal = trip.days.reduce(
    (sum, day) =>
      sum +
      day.activities.reduce((daySum, act) => daySum + act.estimatedCostUsd * trip.travelers, 0),
    0,
  );
  const mealsAndDailyMisc = diffDays * trip.travelers * 42;
  return Math.round(lodging + trip.transportationCostUsd + activitiesTotal + mealsAndDailyMisc);
}

export function useTrips() {
  const { trips, saveTrip, deleteTrip, toggleTripStatus } = useRoamly();

  const upcomingTrips = useMemo(
    () => trips.filter((t) => t.status === 'upcoming'),
    [trips],
  );
  const completedTrips = useMemo(
    () => trips.filter((t) => t.status === 'completed'),
    [trips],
  );

  return {
    trips,
    upcomingTrips,
    completedTrips,
    saveTrip,
    deleteTrip,
    toggleTripStatus,
    calculateTripTotalUsd,
  };
}
