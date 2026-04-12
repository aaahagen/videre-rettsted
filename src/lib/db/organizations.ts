import { collection, doc, getDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Organization } from '../types';

export const createOrganization = async (name: string): Promise<string> => {
  const docRef = await addDoc(collection(db, 'organizations'), { name });
  return docRef.id;
};

export const getOrganization = async (orgId: string): Promise<Organization | null> => {
  const docRef = doc(db, 'organizations', orgId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { ...docSnap.data() as Organization, id: docSnap.id } : null;
};

export const deleteOrganization = async (orgId: string): Promise<void> => {
    const docRef = doc(db, 'organizations', orgId);
    await deleteDoc(docRef);
};

export const updateOrganization = async (orgId: string, data: Partial<Organization>): Promise<void> => {
  const docRef = doc(db, 'organizations', orgId);
  await updateDoc(docRef, data);
};
