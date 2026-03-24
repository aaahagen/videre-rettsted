
import { Place } from '@/lib/types';

// Calculates the distance between two geographical coordinates using the Haversine formula.
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculates the total distance of a route by summing the distances between consecutive places.
export function calculateRouteDistance(places: Place[]): number {
  let totalDistance = 0;
  for (let i = 0; i < places.length - 1; i++) {
    const from = places[i].coordinates;
    const to = places[i + 1].coordinates;
    if (from && to) {
      totalDistance += haversineDistance(from.lat, from.lng, to.lat, to.lng);
    }
  }
  return totalDistance;
}
