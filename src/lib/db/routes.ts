import { collection, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Route } from '../types';

/**
 * Henter en spesifikk rute fra databasen basert på dens unike dokument-ID.
 * 
 * Inkluderer konvertering av Firestore-tidsstempler til standard JavaScript Date-objekter.
 * 
 * @param id - Identifikatoren til ruten som skal hentes.
 * @returns En Promise som løses med et `Route`-objekt, eller `null` hvis ruten ikke finnes.
 * 
 * @example
 * ```typescript
 * const route = await getRoute("route_789");
 * if (route) {
 *   console.log(`Rute: ${route.name}, Status: ${route.status}`);
 * }
 * ```
 */
export const getRoute = async (id: string): Promise<Route | null> => {
  const docRef = doc(db, 'routes', id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    ...data,
    id: docSnap.id,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
  } as Route;
};

/**
 * Henter alle ruter tilhørende en spesifikk organisasjon.
 * 
 * Denne funksjonen brukes primært av ruteplanleggere og administratorer for å få 
 * oversikt over aktive, fullførte og planlagte ruter.
 * 
 * @param orgId - Organisasjonens unike ID.
 * @returns En Promise med en liste over alle rutene knyttet til organisasjonen.
 * 
 * @example
 * ```typescript
 * const allRoutes = await getRoutes("org_123");
 * const activeRoutes = allRoutes.filter(r => r.status === 'active');
 * ```
 */
export const getRoutes = async (orgId: string): Promise<Route[]> => {
  const q = query(collection(db, 'routes'), where('orgId', '==', orgId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return { ...data, id: doc.id } as Route;
  });
};

/**
 * Oppretter en ny kjørerute i systemet.
 * 
 * Genererer automatisk tidsstempler for opprettelse og siste endring.
 * 
 * @param route - Rutedataene som skal lagres. `id` og tidsstempler settes automatisk.
 * @returns En Promise med det nyopprettede `Route`-objektet inkludert ID.
 * 
 * @example
 * ```typescript
 * const newRoute = await createRoute({
 *   name: "Morgenrute Sentrum",
 *   orgId: "org_123",
 *   status: "active",
 *   places: ["place_1", "place_2"]
 * });
 * ```
 */
export const createRoute = async (route: Omit<Route, 'id' | 'createdAt' | 'updatedAt'>): Promise<Route> => {
  const docRef = await addDoc(collection(db, 'routes'), {
    ...route,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return {
    ...route,
    id: docRef.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Route;
};

/**
 * Oppdaterer attributtene til en eksisterende rute.
 * 
 * Brukes for å endre status, legge til stopp (places), eller oppdatere rutenotater.
 * Oppdaterer automatisk `updatedAt`-feltet.
 * 
 * @param id - Identifikatoren til ruten som skal oppdateres.
 * @param updates - De spesifikke feltene som skal endres.
 * @returns En Promise med det oppdaterte ruteobjektet.
 * 
 * @example
 * ```typescript
 * await updateRoute("route_123", { 
 *   status: "completed", 
 *   notes: "Rute fullført uten avvik." 
 * });
 * ```
 */
export const updateRoute = async (id: string, updates: Partial<Route>): Promise<Route> => {
  const docRef = doc(db, 'routes', id);
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
  } as Route;
};

/**
 * Sletter en rute permanent og utfører kaskadesletting av tilhørende manifester.
 * 
 * Dette sikrer dataintegritet ved å fjerne lasteoversikter (manifests) som er 
 * direkte knyttet til ruten som fjernes.
 * 
 * @param orgId - Organisasjonens ID (nødvendig for å finne manifest-subcollection).
 * @param id - Identifikatoren til ruten som skal slettes.
 * @returns En Promise som løses når rute og manifest er slettet.
 * 
 * @example
 * ```typescript
 * await deleteRoute("org_123", "route_abc");
 * ```
 */
export const deleteRoute = async (orgId: string, id: string): Promise<void> => {
  const docRef = doc(db, 'routes', id);
  await deleteDoc(docRef);
  
  // Utfør kaskadesletting av tilhørende manifest hvis det eksisterer
  try {
     const manifestsRef = collection(db, `organizations/${orgId}/manifests`);
     const q = query(manifestsRef, where('routeId', '==', id));
     const snapshot = await getDocs(q);
     
     if (!snapshot.empty) {
         const deletePromises = snapshot.docs.map(docSnap => deleteDoc(doc(db, `organizations/${orgId}/manifests`, docSnap.id)));
         await Promise.all(deletePromises);
     }
  } catch (error) {
      console.error("Feil ved sletting av tilhørende manifest under rutesletting", error);
      // Vi lar ruteslettingen bestå selv om opprydding av manifest feiler
  }
};
