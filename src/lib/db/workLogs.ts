import { collection, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, getDocs, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { WorkLog } from '../types';

export const createWorkLog = async (workLog: Omit<WorkLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkLog> => {
  const docRef = await addDoc(collection(db, 'workLogs'), {
    ...workLog,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  const docSnap = await getDoc(docRef);
  return { id: docSnap.id, ...docSnap.data() } as WorkLog;
};

export const getWorkLog = async (id: string): Promise<WorkLog | null> => {
  const docRef = doc(db, 'workLogs', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as WorkLog;
  }
  return null;
};

// TODO: Cronjob should delete stamps (workLogs) after 3-5 years

export const getWorkLogsForDriver = async (driverId: string, startDate?: string, endDate?: string): Promise<WorkLog[]> => {
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

export const getWorkLogsForOrganization = async (orgId: string, status?: WorkLog['status']): Promise<WorkLog[]> => {
  let q = query(collection(db, 'workLogs'), where('orgId', '==', orgId));
  
  if (status) {
      q = query(q, where('status', '==', status));
  }
  
  q = query(q, orderBy('actualPunchIn', 'desc'));

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkLog));
};

export const updateWorkLog = async (id: string, updates: Partial<WorkLog>): Promise<WorkLog> => {
  const docRef = doc(db, 'workLogs', id);
  await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
  return getWorkLog(id) as Promise<WorkLog>;
};

export const deleteWorkLog = async (id: string): Promise<void> => {
  const docRef = doc(db, 'workLogs', id);
  await deleteDoc(docRef);
};
