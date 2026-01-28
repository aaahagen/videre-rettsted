'use client';

import { collection, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, where, getDocs, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from './firebase';
import { Database } from '../database';
import { Place, User, Organization } from '../types';

const createOrganization = async (name: string): Promise<string> => {
  const docRef = await addDoc(collection(db, 'organizations'), { name });
  return docRef.id;
};

const getOrganization = async (orgId: string): Promise<Organization | null> => {
  const docRef = doc(db, 'organizations', orgId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { ...docSnap.data() as Organization, id: docSnap.id } : null;
};

const createUser = async (uid: string, name: string, email: string, orgId: string, role: 'admin' | 'driver'): Promise<void> => {
  await setDoc(doc(db, 'users', uid), { name, email, orgId, role });
};

const getUser = async (uid: string): Promise<User | null> => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { ...docSnap.data() as User, id: docSnap.id } : null;
};

const createPlace = async (place: any): Promise<Place> => {
  const docRef = await addDoc(collection(db, 'places'), place);
  return { ...place, id: docRef.id };
};

const getPlace = async (id: string): Promise<Place | null> => {
  const docRef = doc(db, 'places', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { ...docSnap.data() as Place, id: docSnap.id } : null;
};

const getPlaces = async (orgId: string): Promise<Place[]> => {
  const q = query(collection(db, 'places'), where('orgId', '==', orgId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ ...doc.data() as Place, id: doc.id }));
};

const updatePlace = async (id: string, updates: Partial<Place>): Promise<Place> => {
  const docRef = doc(db, 'places', id);
  await updateDoc(docRef, updates);
  const updated = await getDoc(docRef);
  return { ...updated.data() as Place, id: updated.id };
};

const deletePlace = async (id: string): Promise<void> => {
  const docRef = doc(db, 'places', id);
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
  createUser,
  getUser,
  createPlace,
  getPlace,
  getPlaces,
  updatePlace,
  deletePlace,
};
