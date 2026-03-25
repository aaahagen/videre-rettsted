
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { getDrivingDistance } from './utils';

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

import { defineSecret } from 'firebase-functions/params';
const googleMapsApiKey = defineSecret('GOOGLE_MAPS_API_KEY');

export const calculateRouteDistance = functions.https.onCall({ secrets: [googleMapsApiKey] }, async (request) => {
    const data = request.data;
    const auth = request.auth;
  if (!auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }
  const uid = auth.uid;
  const userDoc = await db.collection('users').doc(uid).get();
  if (!userDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'User profile not found.');
  }

  const placeIds = data.placeIds;
  if (!Array.isArray(placeIds) || placeIds.length < 2) {
    throw new functions.https.HttpsError('invalid-argument', 'The function must be called with an array of at least two place IDs.');
  }

  try {
    const placeDocs = await Promise.all(
      placeIds.map((id) => db.collection('places').doc(id).get())
    );

    const waypoints = placeDocs
      .map((doc) => {
        const place = doc.data();
        if (place?.coordinates && place.coordinates.lat !== 0 && place.coordinates.lng !== 0) {
          return { lat: place.coordinates.lat, lng: place.coordinates.lng };
        }
        if (place?.address) {
            return place.address;
        }
        return null;
      })
      .filter((p): p is { lat: number; lng: number } | string => p !== null && p !== '');

    if (waypoints.length < placeIds.length) {
        console.warn('Some place IDs could not be found or were missing coordinates.');
    }

    if (waypoints.length < 2) {
      throw new functions.https.HttpsError('not-found', 'Could not find valid coordinates for at least two places.');
    }
    
    const result = await getDrivingDistance(waypoints);

    return { distance: result.distance, duration: result.duration, waypointOrder: result.waypointOrder };
  } catch (error) {
    console.error('Error calculating route distance:', JSON.stringify(error, null, 2));
    // Re-throw the original error to preserve the detailed message from getDrivingDistance
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    // If it's not an HttpsError, wrap it in one but keep the original message.
    const errorMessage = (error instanceof Error) ? error.message : 'An unexpected error occurred.';
    throw new functions.https.HttpsError('internal', errorMessage, (error instanceof Error) ? error.stack : error);
  }
});

// Forced redeploy to pick up new API key secret.
