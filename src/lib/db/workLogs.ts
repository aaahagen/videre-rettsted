import { collection, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, getDocs, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { WorkLog } from '../types';

/**
 * Registrerer en ny arbeidsøkt (stempling) i databasen.
 * 
 * Brukes når en ansatt stempler inn manuelt eller via geofence. Funksjonen 
 * initialiserer økten med system-tidsstempler for opprettelse.
 * 
 * @param workLog - Data for arbeidsøkten (uten ID). Inkluderer fører-ID, organisasjons-ID og innstemplingstidspunkt.
 * @returns En Promise med den lagrede `WorkLog`-modellen inkludert generert ID.
 * 
 * @example
 * ```typescript
 * const log = await createWorkLog({
 *   driverId: "driver_1",
 *   orgId: "org_a",
 *   status: "pending",
 *   actualPunchIn: new Date().toISOString()
 * });
 * ```
 */
export const createWorkLog = async (workLog: Omit<WorkLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkLog> => {
  const docRef = await addDoc(collection(db, 'workLogs'), {
    ...workLog,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  const docSnap = await getDoc(docRef);
  return { id: docSnap.id, ...docSnap.data() } as WorkLog;
};

/**
 * Henter en spesifikk arbeidsøkt basert på ID.
 * 
 * @param id - Identifikatoren til arbeidsøkten.
 * @returns En Promise med `WorkLog`-objektet eller `null`.
 */
export const getWorkLog = async (id: string): Promise<WorkLog | null> => {
  const docRef = doc(db, 'workLogs', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as WorkLog;
  }
  return null;
};

/**
 * Henter alle arbeidsøkter for en spesifikk sjåfør, valgfritt filtrert på dato.
 * 
 * Resultatene sorteres alltid med nyeste innstempling først.
 * 
 * @param driverId - ID-en til sjåføren.
 * @param startDate - Valgfri startdato for filtrering (ISO-streng).
 * @param endDate - Valgfri sluttdato for filtrering (ISO-streng).
 * @returns En Promise med en liste over sjåførens arbeidslogg.
 * 
 * @example
 * ```typescript
 * const marchLogs = await getWorkLogsForDriver("user_123", "2024-03-01", "2024-03-31");
 * ```
 */
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

/**
 * Henter alle arbeidsøkter for en hel organisasjon, valgfritt filtrert på status.
 * 
 * Brukes av administratorer for godkjenning av timelister og lønnskjøring.
 * 
 * @param orgId - Organisasjonens ID.
 * @param status - Valgfri status-filter (f.eks. 'pending', 'approved').
 * @returns En Promise med alle relevante arbeidsøkter for organisasjonen.
 */
export const getWorkLogsForOrganization = async (orgId: string, status?: WorkLog['status']): Promise<WorkLog[]> => {
  let q = query(collection(db, 'workLogs'), where('orgId', '==', orgId));
  
  if (status) {
      q = query(q, where('status', '==', status));
  }
  
  q = query(q, orderBy('actualPunchIn', 'desc'));

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkLog));
};

/**
 * Oppdaterer data for en eksisterende arbeidsøkt.
 * 
 * Brukes typisk ved utstempling eller når en administrator korrigerer/godkjenner en time.
 * 
 * @param id - Identifikatoren til arbeidsøkten som skal endres.
 * @param updates - De spesifikke feltene som skal oppdateres.
 * @returns En Promise med den oppdaterte arbeidsloggen.
 */
export const updateWorkLog = async (id: string, updates: Partial<WorkLog>): Promise<WorkLog> => {
  const docRef = doc(db, 'workLogs', id);
  await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
  return getWorkLog(id) as Promise<WorkLog>;
};

/**
 * Sletter en arbeidsøkt permanent.
 * 
 * @param id - Identifikatoren til økten som skal fjernes.
 */
export const deleteWorkLog = async (id: string): Promise<void> => {
  const docRef = doc(db, 'workLogs', id);
  await deleteDoc(docRef);
};
