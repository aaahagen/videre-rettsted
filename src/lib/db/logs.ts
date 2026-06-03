import { collection, addDoc, query, where, getDocs, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { LogEntry } from '../types';

/**
 * Registrerer en viktig hendelse i systemets revisjonsspor (Audit Log).
 * 
 * Denne funksjonen brukes for å logge kritiske handlinger som krever 
 * sporbarhet i henhold til GDPR og interne sikkerhetsrutiner.
 * 
 * @param orgId - Organisasjonens ID.
 * @param userId - ID-en til brukeren som utførte handlingen.
 * @param action - Type handling som ble utført.
 * @param details - Valgfri metadata knyttet til hendelsen (f.eks. hvilken ansatt som ble sett).
 * 
 * @example
 * ```typescript
 * await logEvent("org_123", "user_abc", "view_sensitive_personnel_data", { targetUserId: "driver_99", targetUserName: "Ola" });
 * ```
 */
export const logEvent = async (orgId: string, userId: string, action: 'create_place' | 'delete_place' | 'login' | 'admin_view_worklog' | 'export_hr_data' | 'view_sensitive_personnel_data' | 'update_hms_checklist', details?: any) => {
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

/**
 * Henter alle revisjonslogger for en spesifikk organisasjon.
 * 
 * @param orgId - Den unike ID-en til organisasjonen.
 * @returns En Promise med en liste over loggføringer (`LogEntry`).
 */
export const getLogs = async (orgId: string): Promise<LogEntry[]> => {
    const q = query(
        collection(db, 'audit_logs'), 
        where('orgId', '==', orgId),
        orderBy('timestamp', 'desc')
    );
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

/**
 * Oppretter en rå loggføring i systemloggen.
 * 
 * @param logEntry - Loggdata uten systemfelter.
 * @returns Dokument-ID for den nye loggføringen.
 */
export const createLogEntry = async (logEntry: Omit<LogEntry, "id" | "timestamp">): Promise<string> => {
  const docRef = await addDoc(collection(db, "logs"), {
    ...logEntry,
    timestamp: serverTimestamp(),
  });
  return docRef.id;
};
