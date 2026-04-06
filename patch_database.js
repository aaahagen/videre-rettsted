const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/firebase/database.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Update createPlace
const oldCreate = `const createPlace = async (place: Omit<Place, 'id' | 'createdAt' | 'updatedAt'>): Promise<Place> => {
  const docRef = await addDoc(collection(db, 'places'), {
    ...place,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: docRef.id, ...place, createdAt: new Date(), updatedAt: new Date() } as Place;
};`;

const newCreate = `const createPlace = async (place: Omit<Place, 'id' | 'createdAt' | 'updatedAt'>): Promise<Place> => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated to create place");
  const docRef = await addDoc(collection(db, 'places'), {
    ...place,
    createdBy: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  const docSnap = await getDoc(docRef);
  return { id: docSnap.id, ...docSnap.data() } as Place;
};`;

content = content.replace(oldCreate, newCreate);

// Update updatePlace
const oldUpdate = `const updatePlace = async (id: string, updates: Partial<Place>): Promise<Place> => {
  const docRef = doc(db, 'places', id);
  await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
  return getPlace(id) as Promise<Place>;
};`;

const newUpdate = `const updatePlace = async (id: string, updates: Partial<Place>): Promise<Place> => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated to update place");
  const docRef = doc(db, 'places', id);
  await updateDoc(docRef, { ...updates, updatedBy: user.uid, updatedAt: serverTimestamp() });
  return getPlace(id) as Promise<Place>;
};`;

content = content.replace(oldUpdate, newUpdate);

fs.writeFileSync(filePath, content);
console.log('Patched database functions for places');
