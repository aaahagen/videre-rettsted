import { doc, updateDoc, collection, addDoc, query, where, getDocs, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { ProofOfDelivery, VehicleInspection } from '../types';

/**
 * Sender inn bevis for levering (Proof of Delivery) for et spesifikt stopp på en rute.
 * 
 * Funksjonen lagrer POD-data (bilder, signatur, koordinater) direkte inn i rutens 
 * `completedStopEvents` kart for rask tilgang og historikk.
 * 
 * @param orgId - Organisasjonens ID.
 * @param routeId - Identifikatoren til ruten.
 * @param placeId - Identifikatoren til leveringsstedet (stoppet).
 * @param pod - Objektet som inneholder leveringsbeviset.
 * 
 * @example
 * ```typescript
 * await submitProofOfDelivery("org_123", "route_456", "place_789", {
 *   status: "delivered",
 *   photoUrl: "https://storage.googleapis.com/...",
 *   deliveredAt: new Date()
 * });
 * ```
 */
export const submitProofOfDelivery = async (orgId: string, routeId: string, placeId: string, pod: ProofOfDelivery): Promise<void> => {
  const routeRef = doc(db, `organizations/${orgId}/routes/${routeId}`);
  
  await updateDoc(routeRef, {
    [`completedStopEvents.${placeId}.pod`]: pod,
    updatedAt: serverTimestamp()
  });
};

/**
 * Lagrer en gjennomført kjøretøykontroll (pre- eller post-trip).
 * 
 * Funksjonen arkiverer sjekklisten i en egen subcollection for full sporbarhet 
 * og samsvar med transportforskrifter.
 * 
 * @param inspection - Kontrolldata (uten ID). Inkluderer sjekkpunkter og kjøretøy-ID.
 * @returns En Promise som løses med dokument-ID for den lagrede kontrollen.
 */
export const submitVehicleInspection = async (inspection: Omit<VehicleInspection, 'id'>): Promise<string> => {
  const orgRef = doc(db, 'organizations', inspection.orgId);
  const inspectionsRef = collection(orgRef, 'vehicleInspections');
  const docRef = await addDoc(inspectionsRef, {
    ...inspection,
    timestamp: serverTimestamp(),
  });
  return docRef.id;
};

/**
 * Henter historikk over tekniske kontroller for et spesifikt kjøretøy.
 * 
 * Resultatene sorteres kronologisk med den nyeste kontrollen først.
 * 
 * @param orgId - Organisasjonens ID.
 * @param vehicleId - Kjøretøyets ID.
 * @returns En liste over gjennomførte kontroller.
 */
export const getVehicleInspections = async (orgId: string, vehicleId: string): Promise<VehicleInspection[]> => {
  const inspectionsRef = collection(db, `organizations/${orgId}/vehicleInspections`);
  const q = query(inspectionsRef, where('vehicleId', '==', vehicleId), orderBy('timestamp', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VehicleInspection));
};
