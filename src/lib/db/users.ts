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
  
  // Firestore does not allow undefined values in updateDoc. We must remove them or convert them to null/deleteField.
  // We'll clean the data object before sending it to Firestore.
  const cleanData = { ...data };
  
  // Recursively clean object to remove undefined values
  const cleanObject = (obj: any) => {
    Object.keys(obj).forEach(key => {
      if (obj[key] === undefined) {
        delete obj[key];
      } else if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key]) && !(obj[key] instanceof Date) && !obj[key]._methodName) {
        cleanObject(obj[key]);
      }
    });
  };
  
  cleanObject(cleanData);

  await updateDoc(docRef, cleanData);
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
