import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { LogEntry } from '../types';

export const logEvent = async (orgId: string, userId: string, action: 'create_place' | 'delete_place' | 'login' | 'admin_view_worklog' | 'export_hr_data', details?: any) => {
    try {
        await addDoc(collection(db, 'audit_logs'), {
            orgId,
            userId,
            action,
            details: details || {},
            timestamp: serverTimestamp()
        });
    } catch (e) {
        console.error("Failed to log event", e);
    }
};

export const getLogs = async (orgId: string): Promise<LogEntry[]> => {
    const q = query(collection(db, 'audit_logs'), where('orgId', '==', orgId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            id: doc.id,
            timestamp: data.timestamp
        } as LogEntry;
    });
};

export const createLogEntry = async (logEntry: Omit<LogEntry, "id" | "timestamp">): Promise<string> => {
  const docRef = await addDoc(collection(db, "logs"), {
    ...logEntry,
    timestamp: serverTimestamp(),
  });
  return docRef.id;
};