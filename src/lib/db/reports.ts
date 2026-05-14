import { collection, doc, getDocs, addDoc, updateDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { DangerReport } from '../types';

export const getReports = async (orgId: string): Promise<DangerReport[]> => {
  const q = query(
    collection(db, 'reports'),
    where('orgId', '==', orgId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as DangerReport));
};

export const createReport = async (reportData: Omit<DangerReport, 'id' | 'createdAt' | 'status'>): Promise<DangerReport> => {
  const docRef = await addDoc(collection(db, 'reports'), {
    ...reportData,
    status: 'open',
    createdAt: serverTimestamp()
  });
  return { ...reportData, id: docRef.id, status: 'open', createdAt: new Date() } as DangerReport;
};

export const resolveReport = async (reportId: string, resolutionNote: string, resolutionImages: string[], resolvedBy: string): Promise<void> => {
  const ref = doc(db, 'reports', reportId);
  await updateDoc(ref, {
    status: 'resolved',
    resolvedAt: serverTimestamp(),
    resolvedBy,
    resolutionNote,
    resolutionImages
  });
};
