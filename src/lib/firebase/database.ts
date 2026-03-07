'use client';

import { collection, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, where, getDocs, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase';
import { Database } from '../database';
import { Place, User, Organization, Route, LogEntry } from '../types';

export const logEvent = async (orgId: string, userId: string, action: 'create_place' | 'delete_place' | 'login', details?: any) => {
    try {
        await addDoc(collection(db, 'audit_logs'), {
            orgId,
            userId,
            action,
            details: details || {},
            timestamp: serverTimestamp()
        });
    } catch (e) {
        console.error("Failed to log event", e);
    }
};

export const getLogs = async (orgId: string): Promise<LogEntry[]> => {
    const q = query(collection(db, 'audit_logs'), where('orgId', '==', orgId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            id: doc.id,
            timestamp: data.timestamp
        } as LogEntry;
    });
};

const createOrganization = async (name: string): Promise<string> => {
  const docRef = await addDoc(collection(db, 'organizations'), { name });
  return docRef.id;
};

const getOrganization = async (orgId: string): Promise<Organization | null> => {
  const docRef = doc(db, 'organizations', orgId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { ...docSnap.data() as Organization, id: docSnap.id } : null;
};

const deleteOrganization = async (orgId: string): Promise<void> => {
    const docRef = doc(db, 'organizations', orgId);
    await deleteDoc(docRef);
};

const updateOrganization = async (orgId: string, data: Partial<Organization>): Promise<void> => {
  const docRef = doc(db, 'organizations', orgId);
  await updateDoc(docRef, data);
};

const createUser = async (uid: string, name: string, email: string, orgId: string, role: 'admin' | 'driver'): Promise<void> => {
  await setDoc(doc(db, 'users', uid), { name, email, orgId, role, favorites: [] });
};

const getUser = async (uid: string): Promise<User | null> => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { ...docSnap.data() as User, id: docSnap.id } : null;
};

const getUsers = async (orgId: string): Promise<User[]> => {
  const q = query(collection(db, 'users'), where('orgId', '==', orgId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return { ...data, id: doc.id } as User;
  });
};

const updateUser = async (uid: string, data: Partial<User>): Promise<void> => {
  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, data);
};

const deleteUser = async (uid: string): Promise<void> => {
    const docRef = doc(db, 'users', uid);
    await deleteDoc(docRef);
};

const createPlace = async (place: Omit<Place, 'id'>): Promise<Place> => {
  const docRef = await addDoc(collection(db, 'places'), {
    ...place,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Log event
  const orgId = place.orgId || place.organizationId;
  const authorId = place.createdBy || place.authorId;
  
  if (orgId && authorId) {
      logEvent(orgId, authorId, 'create_place', { placeId: docRef.id, name: place.name });
  }

  return { ...place, id: docRef.id } as Place;
};

const getPlace = async (id: string): Promise<Place | null> => {
  const docRef = doc(db, 'places', id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    ...data,
    id: docSnap.id,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
  } as Place;
};

const getPlaces = async (orgId: string): Promise<Place[]> => {
  const q = query(collection(db, 'places'), where('orgId', '==', orgId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    } as Place;
  });
};

const updatePlace = async (id: string, updates: Partial<Place>): Promise<Place> => {
  const docRef = doc(db, 'places', id);
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
  } as Place;
};

const deletePlace = async (id: string): Promise<void> => {
  const docRef = doc(db, 'places', id);
  
  // Fetch place before delete to log event
  const placeSnap = await getDoc(docRef);
  if (placeSnap.exists()) {
      const placeData = placeSnap.data() as Place;
      const currentUser = auth.currentUser;
      const orgId = placeData.orgId || placeData.organizationId;
      
      if (currentUser && orgId) {
          logEvent(orgId, currentUser.uid, 'delete_place', { placeId: id, name: placeData.name });
      }
  }

  await deleteDoc(docRef);
};

// Route methods
const getRoute = async (id: string): Promise<Route | null> => {
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

const getRoutes = async (orgId: string): Promise<Route[]> => {
  const q = query(collection(db, 'routes'), where('orgId', '==', orgId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    } as Route;
  });
};

const createRoute = async (route: Omit<Route, 'id' | 'createdAt' | 'updatedAt'>): Promise<Route> => {
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

const updateRoute = async (id: string, updates: Partial<Route>): Promise<Route> => {
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

const deleteRoute = async (id: string): Promise<void> => {
  const docRef = doc(db, 'routes', id);
  await deleteDoc(docRef);
};

export const toggleFavorite = async (userId: string, placeId: string) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const userData = userSnap.data();
    const favorites = userData.favorites || [];
    if (favorites.includes(placeId)) {
      await updateDoc(userRef, { favorites: arrayRemove(placeId) });
    } else {
      await updateDoc(userRef, { favorites: arrayUnion(placeId) });
    }
  }
};

export const firebaseDB: Database = {
  createOrganization,
  getOrganization,
  deleteOrganization,
  updateOrganization,
  createUser,
  getUser,
  getUsers,
  updateUser,
  deleteUser,
  createPlace,
  getPlace,
  getPlaces,
  updatePlace,
  deletePlace,
  getRoute,
  getRoutes,
  createRoute,
  updateRoute,
  deleteRoute,
};
