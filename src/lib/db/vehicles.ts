import { collection, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Vehicle } from '../types';

export const createVehicle = async (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle> => {
  const docRef = await addDoc(collection(db, 'vehicles'), {
    ...vehicle,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return {
    ...vehicle,
    id: docRef.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Vehicle;
};

export const getVehicle = async (id: string): Promise<Vehicle | null> => {
  const docRef = doc(db, 'vehicles', id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    ...data,
    id: docSnap.id,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
  } as Vehicle;
};

export const getVehicles = async (orgId: string): Promise<Vehicle[]> => {
  const q = query(collection(db, 'vehicles'), where('orgId', '==', orgId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    } as Vehicle;
  });
};

export const updateVehicle = async (id: string, updates: Partial<Vehicle>): Promise<Vehicle> => {
  const docRef = doc(db, 'vehicles', id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
  const updated = await getDoc(docRef);
  const data = updated.data()!;
  return {
    ...data,
    id: updated.id,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
  } as Vehicle;
};

export const deleteVehicle = async (id: string): Promise<void> => {
  const docRef = doc(db, 'vehicles', id);
  await deleteDoc(docRef);
};
