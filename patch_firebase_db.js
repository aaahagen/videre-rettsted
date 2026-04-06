const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/firebase/database.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add WorkLog to imports
content = content.replace("import { Place, User, Organization, Route, Vehicle } from '../types';", "import { Place, User, Organization, Route, Vehicle, WorkLog } from '../types';");

// 2. Add WorkLog methods implementation
const workLogImplementation = `
// --- WorkLogs ---

const createWorkLog = async (workLog: Omit<WorkLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkLog> => {
  const docRef = await addDoc(collection(db, 'workLogs'), {
    ...workLog,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  const docSnap = await getDoc(docRef);
  return { id: docSnap.id, ...docSnap.data() } as WorkLog;
};

const getWorkLog = async (id: string): Promise<WorkLog | null> => {
  const docRef = doc(db, 'workLogs', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as WorkLog;
  }
  return null;
};

const getWorkLogsForDriver = async (driverId: string, startDate?: string, endDate?: string): Promise<WorkLog[]> => {
  let q = query(collection(db, 'workLogs'), where('driverId', '==', driverId));
  
  if (startDate) {
      q = query(q, where('actualPunchIn', '>=', startDate));
  }
  if (endDate) {
      q = query(q, where('actualPunchIn', '<=', endDate + 'T23:59:59Z'));
  }
  
  q = query(q, orderBy('actualPunchIn', 'desc'));

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkLog));
};

const getWorkLogsForOrganization = async (orgId: string, status?: WorkLog['status']): Promise<WorkLog[]> => {
  let q = query(collection(db, 'workLogs'), where('orgId', '==', orgId));
  
  if (status) {
      q = query(q, where('status', '==', status));
  }
  
  q = query(q, orderBy('actualPunchIn', 'desc'));

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkLog));
};

const updateWorkLog = async (id: string, updates: Partial<WorkLog>): Promise<WorkLog> => {
  const docRef = doc(db, 'workLogs', id);
  await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
  return getWorkLog(id) as Promise<WorkLog>;
};

const deleteWorkLog = async (id: string): Promise<void> => {
  const docRef = doc(db, 'workLogs', id);
  await deleteDoc(docRef);
};
`;

// Insert before the export const firebaseDB
const exportIndex = content.lastIndexOf('export const firebaseDB: Database = {');
content = content.slice(0, exportIndex) + workLogImplementation + '\n' + content.slice(exportIndex);

// 3. Add to the exported object
const exportedObjectRegex = /export const firebaseDB: Database = {[\s\S]*?};/;
const exportedObjectMatch = content.match(exportedObjectRegex);

if (exportedObjectMatch) {
    const exportedObject = exportedObjectMatch[0];
    const newExportedObject = exportedObject.replace(
        'deleteVehicle,', 
        'deleteVehicle,\n  createWorkLog,\n  getWorkLog,\n  getWorkLogsForDriver,\n  getWorkLogsForOrganization,\n  updateWorkLog,\n  deleteWorkLog,'
    );
    content = content.replace(exportedObject, newExportedObject);
} else {
    console.error("Could not find firebaseDB export");
}

fs.writeFileSync(filePath, content);
console.log('Updated firebase database implementation properly');
