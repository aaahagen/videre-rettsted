import { collection, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import { Place } from '../types';
import { logEvent } from '../db/logs'; 
import { ref, getStorage, deleteObject } from 'firebase/storage';
import { cleanObject } from '../utils';

export const createPlace = async (place: Omit<Place, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<Place> => {
  const user = auth.currentUser;
  if (!user) throw new Error("User must be logged in to create a place");

  const docRef = await addDoc(collection(db, 'places'), cleanObject({
    ...place,
    createdBy: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));

  // Log event
  const orgId = place.orgId || place.organizationId;
  const authorId = user.uid;
  
  if (orgId && authorId) {
      logEvent(orgId, authorId, 'create_place', { placeId: docRef.id, name: place.name });
  }

  return { ...place, id: docRef.id } as Place;
};

export const getPlace = async (id: string): Promise<Place | null> => {
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

export const getPlaces = async (orgId: string): Promise<Place[]> => {
  const q = query(collection(db, 'places'), where('orgId', '==', orgId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return { ...data, id: doc.id } as Place;
  });
};

export const updatePlace = async (id: string, updates: Partial<Place>): Promise<Place> => {
  const user = auth.currentUser;
  if (!user) throw new Error("User must be logged in to update a place");
  const docRef = doc(db, 'places', id);
  
  await updateDoc(docRef, cleanObject({
    ...updates,
    updatedBy: user.uid,
    updatedAt: serverTimestamp(),
  }));

  const updated = await getDoc(docRef);
  const data = updated.data()!;
  return {
    ...data,
    id: updated.id,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
  } as Place;
};

export const deletePlace = async (id: string): Promise<void> => {
  const docRef = doc(db, 'places', id);
  
  // Fetch place before delete to log event and get image URLs
  const placeSnap = await getDoc(docRef);
  if (placeSnap.exists()) {
      const placeData = placeSnap.data() as Place;
      const currentUser = auth.currentUser;
      const orgId = placeData.orgId || placeData.organizationId;
      
      // 1. Delete associated images from Firebase Storage
      if (placeData.images && Array.isArray(placeData.images)) {
          for (const image of placeData.images) {
              if (image.url && !image.url.includes('placeholder')) {
                  try {
                      const storageRef = ref(getStorage(), image.url);
                      await deleteObject(storageRef);
                  } catch (imgError) {
                      console.error(`Failed to delete image ${image.url} for place ${id}:`, imgError);
                      // Continue deleting the place even if an image fails (e.g., already deleted)
                  }
              }
          }
      }

      // 2. Log event
      if (currentUser && orgId) {
          logEvent(orgId, currentUser.uid, 'delete_place', { placeId: id, name: placeData.name });
      }
  }

  // 3. Delete the document
  await deleteDoc(docRef);
};
