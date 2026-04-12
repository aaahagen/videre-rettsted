import { doc, updateDoc, collection, addDoc, query, where, getDocs, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { ProofOfDelivery, VehicleInspection } from '../types';

export const submitProofOfDelivery = async (orgId: string, routeId: string, placeId: string, pod: ProofOfDelivery): Promise<void> => {
  const routeRef = doc(db, `organizations/${orgId}/routes/${routeId}`);
  
  await updateDoc(routeRef, {
    [`completedStopEvents.${placeId}.pod`]: pod,
    updatedAt: serverTimestamp()
  });
};

export const submitVehicleInspection = async (inspection: Omit<VehicleInspection, 'id'>): Promise<string> => {
  const orgRef = doc(db, 'organizations', inspection.orgId);
  const inspectionsRef = collection(orgRef, 'vehicleInspections');
  const docRef = await addDoc(inspectionsRef, {
    ...inspection,
    timestamp: serverTimestamp(),
  });
  return docRef.id;
};

export const getVehicleInspections = async (orgId: string, vehicleId: string): Promise<VehicleInspection[]> => {
  const inspectionsRef = collection(db, `organizations/${orgId}/vehicleInspections`);
  const q = query(inspectionsRef, where('vehicleId', '==', vehicleId), orderBy('timestamp', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VehicleInspection));
};
