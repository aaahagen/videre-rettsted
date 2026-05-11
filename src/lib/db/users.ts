import { collection, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, where, getDocs, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { User } from '../types';

/**
 * Oppretter en ny brukerprofil i Firestore-databasen.
 * 
 * Denne funksjonen brukes etter at en bruker har fullført registrering eller 
 * akseptert en invitasjon. Den initialiserer standardverdier som favorittliste.
 * 
 * @param uid - Den unike identifikatoren fra Firebase Authentication.
 * @param name - Fullt navn på brukeren.
 * @param email - Brukerens e-postadresse.
 * @param orgId - ID-en til organisasjonen brukeren tilhører.
 * @param role - Brukerens tilgangsnivå (f.eks. 'admin', 'driver', 'owner').
 * 
 * @example
 * ```typescript
 * await createUser("auth_uid_123", "Ola Nordmann", "ola@transport.no", "org_abc", "driver");
 * ```
 */
export const createUser = async (uid: string, name: string, email: string, orgId: string, role: string): Promise<void> => {
  await setDoc(doc(db, 'users', uid), { name, email, orgId, role, favorites: [] });
};

/**
 * Henter profilinformasjon for en spesifikk bruker.
 * 
 * @param uid - Brukerens unike ID (fra Auth).
 * @returns En Promise som løses med et `User`-objekt, eller `null` hvis profilen ikke finnes.
 */
export const getUser = async (uid: string): Promise<User | null> => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { ...docSnap.data() as User, id: docSnap.id } : null;
};

/**
 * Henter alle brukere tilknyttet en organisasjon.
 * 
 * Brukes typisk i admin-panelet for å administrere ansatte og tilganger.
 * 
 * @param orgId - ID-en til organisasjonen.
 * @returns En Promise med en liste over alle brukernes profiler.
 * 
 * @example
 * ```typescript
 * const employees = await getUsers("org_123");
 * const driversOnly = employees.filter(u => u.role === 'driver');
 * ```
 */
export const getUsers = async (orgId: string): Promise<User[]> => {
  const q = query(collection(db, 'users'), where('orgId', '==', orgId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return { ...data, id: doc.id } as User;
  });
};

/**
 * Oppdaterer profilinformasjon for en bruker med avansert datarensing.
 * 
 * Funksjonen utfører en dyp rensing av inndata for å fjerne `undefined`-verdier, 
 * samtidig som den bevarer spesielle Firestore-typer som `deleteField()`.
 * 
 * @param uid - ID-en til brukeren som skal oppdateres.
 * @param data - Delvis brukerobjekt med feltene som skal endres.
 * 
 * @example
 * ```typescript
 * await updateUser("user_123", { name: "Ola N. Nordmann", status: "active" });
 * ```
 */
export const updateUser = async (uid: string, data: Partial<User>): Promise<void> => {
  const docRef = doc(db, 'users', uid);
  
  /**
   * Rekursiv hjelpefunksjon for å rense objekter før lagring i Firestore.
   * @internal
   */
  const deepClean = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj._methodName || (obj.constructor && obj.constructor.name === 'FieldValue')) {
        return obj; 
    }

    if (Array.isArray(obj)) {
      return obj.map(item => deepClean(item)).filter(item => item !== undefined);
    }

    const cleaned: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (obj[key] !== undefined) {
          cleaned[key] = deepClean(obj[key]);
        }
      }
    }
    return cleaned;
  };

  const finalData = deepClean(data);
  await updateDoc(docRef, finalData);
};

/**
 * Fjerner en brukerprofil permanent fra databasen.
 * 
 * @param uid - ID-en til brukeren som skal slettes.
 */
export const deleteUser = async (uid: string): Promise<void> => {
    const docRef = doc(db, 'users', uid);
    await deleteDoc(docRef);
};

/**
 * Legger til eller fjerner et leveringssted fra brukerens favorittliste.
 * 
 * @param userId - ID-en til brukeren.
 * @param placeId - ID-en til stedet som skal toggles.
 * 
 * @example
 * ```typescript
 * await toggleFavorite("user_123", "place_456");
 * ```
 */
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

/**
 * Markerer et sted som besøkt av brukeren.
 * 
 * Brukes for å generere statistikk og historikk over sjåførens aktiviteter.
 * 
 * @param userId - ID-en til brukeren.
 * @param placeId - ID-en til stedet som er besøkt.
 */
export const markPlaceVisited = async (userId: string, placeId: string) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { visitedPlaces: arrayUnion(placeId) });
};
