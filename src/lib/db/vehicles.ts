import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, serverTimestamp, Timestamp, arrayUnion, arrayRemove, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Vehicle, VehicleDamageReport } from '../types';
import { cleanObject } from '../utils';

/**
 * Henter alle registrerte kjøretøy tilhørende en organisasjon.
 * 
 * Resultatet inkluderer tekniske detaljer som registreringsnummer, EU-kontrollfrister 
 * og nåværende operasjonell status.
 * 
 * @param orgId - Den unike ID-en til organisasjonen.
 * @returns En Promise som løses med en liste over `Vehicle`-objekter.
 * @throws Feil ved databaseoppslag.
 * 
 * @example
 * ```typescript
 * const myFleet = await getVehicles("org_123");
 * console.log(`Bedriften har ${myFleet.length} enheter i bilparken.`);
 * ```
 */
export async function getVehicles(orgId: string): Promise<Vehicle[]> {
  try {
    const q = query(collection(db, 'vehicles'), where('orgId', '==', orgId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
      updatedAt: (doc.data().updatedAt as Timestamp)?.toDate() || new Date(),
    })) as Vehicle[];
  } catch (error) {
    console.error("Error getting vehicles:", error);
    throw error;
  }
}

/**
 * Henter detaljert informasjon om et spesifikt kjøretøy.
 * 
 * @param id - Dokument-ID-en til kjøretøyet i Firestore.
 * @returns En Promise som løses med et `Vehicle`-objekt eller `null`.
 */
export async function getVehicle(id: string): Promise<Vehicle | null> {
  try {
    const docRef = doc(db, 'vehicles', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: (docSnap.data().createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (docSnap.data().updatedAt as Timestamp)?.toDate() || new Date(),
      } as Vehicle;
    }
    return null;
  } catch (error) {
    console.error("Error getting vehicle:", error);
    throw error;
  }
}

/**
 * Registrerer en ny enhet i bilparken.
 * 
 * Funksjonen renser inndata for systemfelter og setter standardstatus til 'ready'.
 * 
 * @param data - Kjøretøydata (uten ID og tidsstempler).
 * @returns En Promise med det nyopprettede `Vehicle`-objektet inkludert ID.
 * 
 * @example
 * ```typescript
 * const newTruck = await createVehicle({
 *   name: "Lastebil 1",
 *   plateNumber: "AB12345",
 *   type: "truck",
 *   orgId: "org_123"
 * });
 * ```
 */
export async function createVehicle(data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle> {
  try {
    const { id, createdAt, updatedAt, ...rest } = data as any;
    const finalData = cleanObject(rest);

    const docRef = await addDoc(collection(db, 'vehicles'), {
      ...finalData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      currentStatuses: finalData.currentStatuses || ['ready'],
    });
    return { id: docRef.id, ...data, createdAt: new Date(), updatedAt: new Date() } as Vehicle;
  } catch (error) {
    console.error("Error creating vehicle:", error);
    throw error;
  }
}

/**
 * Oppdaterer tekniske data eller informasjon om et kjøretøy.
 * 
 * @param id - Identifikatoren til kjøretøyet.
 * @param data - Delvis modell med feltene som skal endres.
 */
export async function updateVehicle(id: string, data: Partial<Vehicle>): Promise<void> {
  try {
    const docRef = doc(db, 'vehicles', id);
    const { id: _, createdAt, updatedAt, ...rest } = data as any;
    const finalData = cleanObject(rest);

    await updateDoc(docRef, {
      ...finalData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating vehicle:", error);
    throw error;
  }
}

/**
 * Sletter et kjøretøy permanent fra registeret.
 * 
 * @param id - Identifikatoren til kjøretøyet.
 */
export async function deleteVehicle(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'vehicles', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    throw error;
  }
}

/**
 * Legger til en operasjonell status på et kjøretøy.
 * 
 * Hvis statusen som legges til er noe annet enn 'ready', fjernes 'ready'-flagget 
 * automatisk for å indikere at enheten krever oppmerksomhet eller er i bruk.
 * 
 * @param id - Kjøretøyets ID.
 * @param status - Statusstreng (f.eks. 'observation', 'workshop').
 * 
 * @example
 * ```typescript
 * await addVehicleStatus("v123", "observation");
 * ```
 */
export async function addVehicleStatus(id: string, status: string): Promise<void> {
    try {
        const docRef = doc(db, 'vehicles', id);
        if (status !== 'ready') {
             await updateDoc(docRef, {
                currentStatuses: arrayRemove('ready')
            });
        }
        await updateDoc(docRef, {
            currentStatuses: arrayUnion(status),
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error adding vehicle status:", error);
        throw error;
    }
}

/**
 * Fjerner en spesifikk status fra et kjøretøy.
 * 
 * Dersom kjøretøyet står uten statuser etter fjerning, settes det automatisk tilbake til 'ready'.
 * 
 * @param id - Kjøretøyets ID.
 * @param status - Statusen som skal fjernes.
 */
export async function removeVehicleStatus(id: string, status: string): Promise<void> {
    try {
        const docRef = doc(db, 'vehicles', id);
        await updateDoc(docRef, {
            currentStatuses: arrayRemove(status),
            updatedAt: serverTimestamp(),
        });
        
        const updatedDoc = await getDoc(docRef);
        if (updatedDoc.exists() && (!updatedDoc.data().currentStatuses || updatedDoc.data().currentStatuses.length === 0)) {
            await updateDoc(docRef, {
                 currentStatuses: ['ready'],
                 updatedAt: serverTimestamp(),
            })
        }
        
    } catch (error) {
        console.error("Error removing vehicle status:", error);
        throw error;
    }
}

/**
 * Henter historikk over skaderapporter for et spesifikt kjøretøy.
 * 
 * @param vehicleId - ID-en til kjøretøyet.
 * @param orgId - Valgfri organisasjons-ID for filtrering (sikkerhet).
 * @returns En liste over skaderapporter sortert nyeste først.
 */
export async function getVehicleDamages(vehicleId: string, orgId?: string): Promise<VehicleDamageReport[]> {
  try {
    let q;
    if (orgId) {
       q = query(
        collection(db, 'vehicleDamages'),
        where('orgId', '==', orgId),
        where('vehicleId', '==', vehicleId)
      );
    } else {
       q = query(
        collection(db, 'vehicleDamages'),
        where('vehicleId', '==', vehicleId)
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        resolvedAt: data.resolvedAt ? (data.resolvedAt as Timestamp).toDate() : undefined,
      };
    }).sort((a: any, b: any) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
      const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
      return dateB - dateA;
    }) as VehicleDamageReport[];
  } catch (error) {
    console.error("Error getting vehicle damages:", error);
    throw error;
  }
}

/**
 * Oppretter en ny skaderapport og setter kjøretøyet automatisk i 'observation'-status.
 * 
 * @param data - Skaderapport-data (uten ID).
 * @returns Den opprettede rapporten.
 */
export async function reportVehicleDamage(data: Omit<VehicleDamageReport, 'id' | 'createdAt'>): Promise<VehicleDamageReport> {
  try {
    const docRef = await addDoc(collection(db, 'vehicleDamages'), {
      ...data,
      createdAt: serverTimestamp(),
      status: 'reported'
    });
    
    const vehicleRef = doc(db, 'vehicles', data.vehicleId);
    await updateDoc(vehicleRef, {
        currentStatuses: arrayUnion('observation')
    });

    return { id: docRef.id, ...data, createdAt: new Date() } as VehicleDamageReport;
  } catch (error) {
    console.error("Error reporting vehicle damage:", error);
    throw error;
  }
}

/**
 * Oppdaterer detaljer i en eksisterende skaderapport.
 * 
 * @param id - Rapporten ID.
 * @param data - Felter som skal endres.
 */
export async function updateVehicleDamageReport(id: string, data: Partial<VehicleDamageReport>): Promise<void> {
  try {
    const docRef = doc(db, 'vehicleDamages', id);
    const { id: _, createdAt, ...rest } = data as any;
    await updateDoc(docRef, {
      ...rest,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating vehicle damage report:", error);
    throw error;
  }
}

/**
 * Endrer status på en skadesak (f.eks. fra 'reported' til 'fixed').
 * 
 * Dersom status settes til 'fixed', lagres automatisk tidspunkt og hvem som løste saken.
 * 
 * @param damageId - ID-en til skadesaken.
 * @param status - Den nye statusen.
 * @param resolvedBy - Valgfri bruker-ID som markerte saken som utbedret.
 */
export async function updateDamageStatus(damageId: string, status: 'reported' | 'in_progress' | 'fixed', resolvedBy?: string): Promise<void> {
  try {
    const docRef = doc(db, 'vehicleDamages', damageId);
    const updateData: any = { status };
    if (status === 'fixed') {
        updateData.resolvedAt = serverTimestamp();
        updateData.resolvedBy = resolvedBy;
    }
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error("Error updating damage status:", error);
    throw error;
  }
}

/**
 * Henter en logg over kjøretøyets bruk i ruter de siste dagene.
 * 
 * @param vehicleId - Kjøretøyets ID.
 * @param days - Antall dager tilbake i tid (standard er 7).
 * @returns En liste over rute-hendelser knyttet til kjøretøyet.
 */
export async function getVehicleUsageLog(vehicleId: string, days: number = 7): Promise<any[]> {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const q = query(
            collection(db, 'routes'),
            where('vehicleId', '==', vehicleId),
            where('date', '>=', startDate.toISOString().split('T')[0])
        );
        const querySnapshot = await getDocs(q);
        
        const usage = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                routeId: doc.id,
                date: data.date,
                driverId: data.driverId,
                status: data.status,
            };
        });

        return usage.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
        console.error("Error getting vehicle usage:", error);
        return [];
    }
}
