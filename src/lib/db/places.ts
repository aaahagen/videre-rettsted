import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, serverTimestamp, Timestamp, runTransaction } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Place, Organization } from '../types';
import { cleanObject } from '../utils';

/**
 * Hjelpefunksjon for robust konvertering av Firestore-verdier til standard JavaScript Date-objekter.
 * 
 * @param val - Verdien som skal konverteres (Timestamp, Date, streng eller tall).
 * @returns Et gyldig Date-objekt.
 * @internal
 */
const ensureDate = (val: any): Date => {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (typeof val.toDate === 'function') return val.toDate();
  return new Date(val); 
};

/**
 * Henter alle lagrede leveringssteder tilhørende en spesifikk organisasjon.
 * 
 * Brukes primært for å populere oversiktslister og kartvisninger i dashbordet.
 * 
 * @param orgId - Den unike identifikatoren til organisasjonen (f.eks. "org_123").
 * @returns En Promise som løses med en liste (array) av `Place`-objekter.
 * @throws Feil ved manglende tilgang eller nettverksproblemer.
 * 
 * @example
 * ```typescript
 * const myPlaces = await getPlaces("my-org-id");
 * console.log(`Fant ${myPlaces.length} leveringssteder.`);
 * ```
 */
export async function getPlaces(orgId: string): Promise<Place[]> {
  try {
    const q = query(collection(db, 'places'), where('orgId', '==', orgId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: ensureDate(data.createdAt),
        updatedAt: ensureDate(data.updatedAt),
      } as Place;
    });
  } catch (error) {
    console.error("Error getting places:", error);
    throw error;
  }
}

/**
 * Henter detaljert informasjon om et enkelt leveringssted basert på dets unike ID.
 * 
 * Inkluderer alle metadata som bilder, koordinater, åpningstider og HMS-data.
 * 
 * @param id - Dokument-ID-en til leveringsstedet i Firestore.
 * @returns En Promise som løses med et `Place`-objekt, eller `null` dersom stedet ikke finnes.
 * 
 * @example
 * ```typescript
 * const place = await getPlace("place_abc_123");
 * if (place) {
 *   console.log(`Navn: ${place.name}, Adresse: ${place.address}`);
 * }
 * ```
 */
export async function getPlace(id: string): Promise<Place | null> {
  try {
    const docRef = doc(db, 'places', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: ensureDate(data.createdAt),
        updatedAt: ensureDate(data.updatedAt),
      } as Place;
    }
    return null;
  } catch (error) {
    console.error("Error getting place:", error);
    throw error;
  }
}

/**
 * Oppretter et nytt leveringssted i databasen ved bruk av en atomær transaksjon.
 * 
 * Funksjonen håndterer automatisk generering av kundenummer dersom organisasjonen 
 * har aktivert dette i sine innstillinger. Transaksjonen sikrer at nummerrekkefølgen 
 * forblir korrekt selv ved samtidige opprettelser.
 * 
 * @param place - Dataene for det nye stedet. `id` og tidsstempler utelates da de settes av systemet.
 * @returns En Promise med det nyopprettede `Place`-objektet inkludert ID og tidsstempler.
 * 
 * @example
 * ```typescript
 * const newPlace = await createPlace({
 *   name: "Hovedlageret",
 *   address: "Industriveien 5, 0001 Oslo",
 *   orgId: "org_123",
 *   coordinates: { lat: 59.9, lng: 10.7 }
 * });
 * ```
 */
export async function createPlace(place: Omit<Place, 'id' | 'createdAt' | 'updatedAt'>): Promise<Place> {
  try {
    return await runTransaction(db, async (transaction) => {
      const orgRef = doc(db, 'organizations', place.orgId);
      const orgSnap = await transaction.get(orgRef);
      const orgData = orgSnap.data() as Organization;

      let finalCustomerNumber = place.customerNumber;

      // Logikk for automatisk generering av kundenummer
      if (!finalCustomerNumber && orgData?.placeSettings?.autoGenerateCustomerNumbers) {
        const prefix = orgData.placeSettings.customerNumberPrefix || '';
        const nextNum = orgData.placeSettings.nextCustomerNumber || 1000;
        finalCustomerNumber = `${prefix}${nextNum}`;
        
        // Oppdater neste nummer i sekvensen i organisasjonsdokumentet
        transaction.update(orgRef, {
          'placeSettings.nextCustomerNumber': nextNum + 1
        });
      }

      const docRef = doc(collection(db, 'places'));
      const newPlaceData = cleanObject({
        ...place,
        customerNumber: finalCustomerNumber || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      transaction.set(docRef, newPlaceData);

      return {
        id: docRef.id,
        ...newPlaceData,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Place;
    });
  } catch (error) {
    console.error("Error creating place with transaction:", error);
    throw error;
  }
}

/**
 * Oppdaterer eksisterende data for et spesifikt leveringssted.
 * 
 * Funksjonen renser objektet for `undefined`-verdier før lagring og sørger for at 
 * systemfelter som `createdAt` ikke overskrives.
 * 
 * @param id - Identifikatoren til stedet som skal endres.
 * @param updates - En delvis `Place`-modell med de feltene som skal oppdateres.
 * @returns En Promise med det oppdaterte `Place`-objektet i sin helhet.
 * 
 * @example
 * ```typescript
 * await updatePlace("place_123", { 
 *   notes: "Viktig: Bruk bakdøren etter kl. 16:00" 
 * });
 * ```
 */
export async function updatePlace(id: string, updates: Partial<Place>): Promise<Place> {
  try {
    const docRef = doc(db, 'places', id);
    const updateData = cleanObject({
      ...updates,
      updatedAt: serverTimestamp(),
    });
    // Systemfelter skal ikke inkluderes i en standard oppdatering
    delete (updateData as any).id;
    delete (updateData as any).createdAt;
    
    await updateDoc(docRef, updateData);
    
    const updated = await getDoc(docRef);
    const data = updated.data()!;
    return { 
        id: updated.id, 
        ...data,
        createdAt: ensureDate(data.createdAt),
        updatedAt: ensureDate(data.updatedAt)
    } as Place;
  } catch (error) {
    console.error("Error updating place:", error);
    throw error;
  }
}

/**
 * Sletter et leveringssted permanent fra databasen.
 * 
 * @param id - Identifikatoren til stedet som skal fjernes.
 * @returns En Promise som løses når slettingen er bekreftet av Firestore.
 * @throws Feil ved manglende slettetilgang (kun Admins/Super Admins).
 * 
 * @example
 * ```typescript
 * await deletePlace("place_old_456");
 * ```
 */
export async function deletePlace(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'places', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting place:", error);
    throw error;
  }
}
