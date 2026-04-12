import { collection, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Route } from '../types';

export const getRoute = async (id: string): Promise<Route | null> => {
  const docRef = doc(db, 'routes', id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    ...data,
    id: docSnap.id,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
  } as Route;
};

export const getRoutes = async (orgId: string): Promise<Route[]> => {
  const q = query(collection(db, 'routes'), where('orgId', '==', orgId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return { ...data, id: doc.id } as Route;
  });
};

export const createRoute = async (route: Omit<Route, 'id' | 'createdAt' | 'updatedAt'>): Promise<Route> => {
  const docRef = await addDoc(collection(db, 'routes'), {
    ...route,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return {
    ...route,
    id: docRef.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Route;
};

export const updateRoute = async (id: string, updates: Partial<Route>): Promise<Route> => {
  const docRef = doc(db, 'routes', id);
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
  } as Route;
};

export const deleteRoute = async (orgId: string, id: string): Promise<void> => {
  const docRef = doc(db, 'routes', id);
  await deleteDoc(docRef);
  
  // Also delete associated manifest if it exists
  try {
     const manifestsRef = collection(db, `organizations/${orgId}/manifests`);
     const q = query(manifestsRef, where('routeId', '==', id));
     const snapshot = await getDocs(q);
     
     if (!snapshot.empty) {
         const deletePromises = snapshot.docs.map(docSnap => deleteDoc(doc(db, `organizations/${orgId}/manifests`, docSnap.id)));
         await Promise.all(deletePromises);
     }
  } catch (error) {
      console.error("Failed to delete associated manifest when deleting route", error);
      // We still want the route deletion to succeed even if manifest cleanup fails
  }
};
