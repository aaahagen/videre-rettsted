
import { collection, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { Database } from '../database';

export const firebaseDB: Database = {
  async createOrganization(name: string): Promise<string> {
    const docRef = await addDoc(collection(db, 'organizations'), { name });
    return docRef.id;
  },

  async createUser(uid: string, name: string, email: string, orgId: string, role: 'admin' | 'driver'): Promise<void> {
    await setDoc(doc(db, 'users', uid), { name, email, orgId, role });
  },

  async createPlace(place: any): Promise<string> {
    const docRef = await addDoc(collection(db, 'places'), place);
    return docRef.id;
  },

  async getPlace(id: string): Promise<any> {
    const docRef = doc(db, 'places', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { ...docSnap.data(), id: docSnap.id } : null;
  },

  async getPlaces(orgId: string): Promise<any[]> {
    const q = query(collection(db, 'places'), where('orgId', '==', orgId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  },

  async updatePlace(id: string, updates: any): Promise<void> {
    const docRef = doc(db, 'places', id);
    await updateDoc(docRef, updates);
  },

  async deletePlace(id: string): Promise<void> {
    const docRef = doc(db, 'places', id);
    await deleteDoc(docRef);
  },

  // New methods from the updated interface

  async createRoute(route: any): Promise<string> {
    const docRef = await addDoc(collection(db, 'routes'), route);
    return docRef.id;
  },

  async getRoute(id: string): Promise<any> {
    const docRef = doc(db, 'routes', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { ...docSnap.data(), id: docSnap.id } : null;
  },

  async getRoutes(orgId: string): Promise<any[]> {
    const q = query(collection(db, 'routes'), where('orgId', '==', orgId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  },

  async updateRoute(id: string, updates: any): Promise<void> {
    const docRef = doc(db, 'routes', id);
    await updateDoc(docRef, updates);
  },

  async deleteRoute(id: string): Promise<void> {
    const docRef = doc(db, 'routes', id);
    await deleteDoc(docRef);
  },
};
