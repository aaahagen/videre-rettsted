
import { Client, LatLng } from '@googlemaps/google-maps-services-js';
import * as functions from 'firebase-functions';


// Used via Secret Manager instead of defineString
import { defineSecret } from 'firebase-functions/params';
const googleMapsApiKeySecret = defineSecret('GOOGLE_MAPS_API_KEY');
const mapsClient = new Client({});

export async function getDrivingDistance(waypoints: (LatLng | string)[]): Promise<{ distance: number; duration: number; waypointOrder: number[] }> {
  if (waypoints.length < 2) {
    return { distance: 0, duration: 0, waypointOrder: [] };
  }

  const origin = waypoints[0];
  const destination = waypoints[waypoints.length - 1];
  const intermediateWaypoints = waypoints.slice(1, -1);

  try {
    const response = await mapsClient.directions({
      params: {
        origin,
        destination,
        waypoints: intermediateWaypoints,
        optimize: true,
        key: googleMapsApiKeySecret.value(),
      },
    });

    if (response.data.status !== 'OK') {
        throw new Error(`Google Maps API returned status: ${response.data.status}`);
    }
    
    if (!response.data.routes || response.data.routes.length === 0) {
        throw new Error('Google Maps API returned no routes.');
    }
    
    const totalDistanceMeters = response.data.routes[0].legs.reduce(
      (total, leg) => total + (leg.distance?.value || 0),
      0
    );
    const totalDurationSeconds = response.data.routes[0].legs.reduce(
      (total, leg) => total + (leg.duration?.value || 0),
      0
    );

    const waypointOrder = response.data.routes[0].waypoint_order || [];
    return { distance: totalDistanceMeters / 1000, duration: totalDurationSeconds, waypointOrder };
  } catch (error: any) {
    // Enhanced error logging
    console.error('Google Maps API Error Object:', error);
    console.error('Google Maps API Error Response:', JSON.stringify(error.response?.data, null, 2));
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Google Maps API request failed.',
      error.response?.data
    );
  }
}
