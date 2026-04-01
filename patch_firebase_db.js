const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/firebase/database.ts');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('createVehicle')) {
    // 1. Add Vehicle to imports
    content = content.replace(
        "import { Place, User, Organization, Route, LogEntry } from '../types';",
        "import { Place, User, Organization, Route, LogEntry, Vehicle } from '../types';"
    );

    // 2. Add Vehicle methods
    const vehicleMethods = `
// Vehicle methods
const createVehicle = async (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle> => {
  const docRef = await addDoc(collection(db, 'vehicles'), {
    ...vehicle,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return {
    ...vehicle,
    id: docRef.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Vehicle;
};

const getVehicle = async (id: string): Promise<Vehicle | null> => {
  const docRef = doc(db, 'vehicles', id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    ...data,
    id: docSnap.id,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
  } as Vehicle;
};

const getVehicles = async (orgId: string): Promise<Vehicle[]> => {
  const q = query(collection(db, 'vehicles'), where('orgId', '==', orgId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    } as Vehicle;
  });
};

const updateVehicle = async (id: string, updates: Partial<Vehicle>): Promise<Vehicle> => {
  const docRef = doc(db, 'vehicles', id);
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
  } as Vehicle;
};

const deleteVehicle = async (id: string): Promise<void> => {
  const docRef = doc(db, 'vehicles', id);
  await deleteDoc(docRef);
};
`;

    // Add methods before toggleFavorite (which is near the end)
    content = content.replace('export const toggleFavorite', vehicleMethods + '\nexport const toggleFavorite');

    // 3. Add to firebaseDB export object
    content = content.replace(
        'deleteRoute,',
        'deleteRoute,\n  createVehicle,\n  getVehicle,\n  getVehicles,\n  updateVehicle,\n  deleteVehicle,'
    );

    fs.writeFileSync(filePath, content);
    console.log('Added Vehicle methods to firebase/database.ts');
} else {
    console.log('Vehicle methods already exist in firebase/database.ts');
}
