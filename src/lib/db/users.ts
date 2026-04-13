import { collection, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, where, getDocs, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { User } from '../types';

export const createUser = async (uid: string, name: string, email: string, orgId: string, role: 'admin' | 'driver'): Promise<void> => {
  await setDoc(doc(db, 'users', uid), { name, email, orgId, role, favorites: [] });
};

export const getUser = async (uid: string): Promise<User | null> => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { ...docSnap.data() as User, id: docSnap.id } : null;
};

export const getUsers = async (orgId: string): Promise<User[]> => {
  const q = query(collection(db, 'users'), where('orgId', '==', orgId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return { ...data, id: doc.id } as User;
  });
};

export const updateUser = async (uid: string, data: Partial<User>): Promise<void> => {
  const docRef = doc(db, 'users', uid);
  
  // Create a deep copy to avoid mutating the original object during cleaning
  // But we need to handle Firestore's FieldValue instances (like deleteField) which JSON.stringify would destroy.
  // So instead of JSON.stringify, we do a proper deep clean.
  
  const deepClean = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    // Preserve Firestore FieldValue objects (they usually have a specific prototype or internal fields)
    // FieldValue in v9+ doesn't always expose `_methodName` easily, but we check for common indicators
    if (obj._methodName || (obj.constructor && obj.constructor.name === 'FieldValue')) {
        return obj; 
    }

    if (Array.isArray(obj)) {
      // In arrays, we can't just delete the key. We should filter out undefined.
      // Or map undefined to null if order matters. Let's just remove undefined objects entirely for contracts.
      return obj.map(item => deepClean(item)).filter(item => item !== undefined);
    }

    const cleaned: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (obj[key] !== undefined) {
          cleaned[key] = deepClean(obj[key]);
        }
      }
    }
    return cleaned;
  };

  const finalData = deepClean(data);
  await updateDoc(docRef, finalData);
};

export const deleteUser = async (uid: string): Promise<void> => {
    const docRef = doc(db, 'users', uid);
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

export const markPlaceVisited = async (userId: string, placeId: string) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { visitedPlaces: arrayUnion(placeId) });
};
