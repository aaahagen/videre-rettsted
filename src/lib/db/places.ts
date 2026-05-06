import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, serverTimestamp, Timestamp, runTransaction } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Place, Organization } from '../types';

// Helper for safe date conversion from Firestore
const ensureDate = (val: any): Date => {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (typeof val.toDate === 'function') return val.toDate();
  return new Date(val); // Fallback for ISO strings or numbers
};

export async function getPlaces(orgId: string): Promise<Place[]> {
  try {
    const q = query(collection(db, 'places'), where('orgId', '==', orgId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: ensureDate(data.createdAt),
        updatedAt: ensureDate(data.updatedAt),
      } as Place;
    });
  } catch (error) {
    console.error("Error getting places:", error);
    throw error;
  }
}

export async function getPlace(id: string): Promise<Place | null> {
  try {
    const docRef = doc(db, 'places', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: ensureDate(data.createdAt),
        updatedAt: ensureDate(data.updatedAt),
      } as Place;
    }
    return null;
  } catch (error) {
    console.error("Error getting place:", error);
    throw error;
  }
}

export async function createPlace(place: Omit<Place, 'id' | 'createdAt' | 'updatedAt'>): Promise<Place> {
  try {
    return await runTransaction(db, async (transaction) => {
      const orgRef = doc(db, 'organizations', place.orgId);
      const orgSnap = await transaction.get(orgRef);
      const orgData = orgSnap.data() as Organization;

      let finalCustomerNumber = place.customerNumber;

      // Logic for automatic customer number generation
      if (!finalCustomerNumber && orgData?.placeSettings?.autoGenerateCustomerNumbers) {
        const prefix = orgData.placeSettings.customerNumberPrefix || '';
        const nextNum = orgData.placeSettings.nextCustomerNumber || 1000;
        finalCustomerNumber = `${prefix}${nextNum}`;
        
        // Update the next number in the sequence
        transaction.update(orgRef, {
          'placeSettings.nextCustomerNumber': nextNum + 1
        });
      }

      const docRef = doc(collection(db, 'places'));
      const newPlace = {
        ...place,
        customerNumber: finalCustomerNumber || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      transaction.set(docRef, newPlace);

      return {
        id: docRef.id,
        ...newPlace,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Place;
    });
  } catch (error) {
    console.error("Error creating place with transaction:", error);
    throw error;
  }
}

export async function updatePlace(id: string, updates: Partial<Place>): Promise<Place> {
  try {
    const docRef = doc(db, 'places', id);
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
    };
    // Don't include system fields in update
    delete (updateData as any).id;
    delete (updateData as any).createdAt;
    
    await updateDoc(docRef, updateData);
    
    const updated = await getDoc(docRef);
    const data = updated.data()!;
    return { 
        id: updated.id, 
        ...data,
        createdAt: ensureDate(data.createdAt),
        updatedAt: ensureDate(data.updatedAt)
    } as Place;
  } catch (error) {
    console.error("Error updating place:", error);
    throw error;
  }
}

export async function deletePlace(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'places', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting place:", error);
    throw error;
  }
}
