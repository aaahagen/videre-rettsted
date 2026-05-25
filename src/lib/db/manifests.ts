import { collection, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, getDocs, orderBy, limit, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Manifest, Order, ManifestNote } from '../types';
import { updateOrder } from './orders'; 

/**
 * Oppretter et nytt laste-manifest for en kjørerute.
 * 
 * Funksjonen initialiserer alle ordrer i manifestet med `loadedItems: 0` og 
 * setter standardstatus til 'pending'. Dette sikrer et rent utgangspunkt for 
 * terminalarbeiderne.
 * 
 * @param manifest - Manifestdata (uten ID). Inneholder referanse til rute og tilhørende ordrer.
 * @returns En Promise som løses med den nye manifest-ID-en.
 * 
 * @example
 * ```typescript
 * const manifestId = await createManifest({
 *   orgId: "org_123",
 *   routeId: "route_456",
 *   orders: [{ orderId: "ord_1", barcode: "B123", totalItems: 5 }]
 * });
 * ```
 */
export const createManifest = async (manifest: Omit<Manifest, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const orgRef = doc(db, 'organizations', manifest.orgId);
    const manifestsRef = collection(orgRef, 'manifests');

    // Initialiser tellere for hver ordre i manifestet
    const ordersWithInitializedCounts = manifest.orders.map(orderItem => ({
        ...orderItem,
        totalItems: orderItem.totalItems || 1, 
        loadedItems: 0, 
        status: 'pending' as const, 
    }));

    const docRef = await addDoc(manifestsRef, {
        ...manifest,
        orders: ordersWithInitializedCounts,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
};

/**
 * Henter manifestet tilknyttet en spesifikk rute.
 * 
 * Siden det kun skal eksistere ett manifest per rute, returnerer denne 
 * funksjonen det første treffet.
 * 
 * @param orgId - Organisasjonens ID.
 * @param routeId - Rutens ID.
 * @returns En Promise med `Manifest`-objektet eller `null`.
 */
export const getManifestByRoute = async (orgId: string, routeId: string): Promise<Manifest | null> => {
  const manifestsRef = collection(db, `organizations/${orgId}/manifests`);
  const q = query(manifestsRef, where('routeId', '==', routeId), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as Manifest;
};

/**
 * Oppdaterer generelle metadata på et manifest.
 * 
 * @param orgId - Organisasjonens ID.
 * @param manifestId - Manifestets ID.
 * @param updates - De delvise endringene som skal utføres.
 */
export const updateManifest = async (orgId: string, manifestId: string, updates: Partial<Manifest>): Promise<void> => {
  const docRef = doc(db, `organizations/${orgId}/manifests/${manifestId}`);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Legger til et notat eller en kommentar på lasteoversikten.
 * 
 * @param orgId - Organisasjonens ID.
 * @param manifestId - Manifestets ID.
 * @param note - Notat-data (innhold og type).
 */
export const addManifestNote = async (orgId: string, manifestId: string, note: Omit<ManifestNote, 'createdAt'>): Promise<void> => {
    const docRef = doc(db, `organizations/${orgId}/manifests/${manifestId}`);
    await updateDoc(docRef, {
        notes: arrayUnion({
            ...note,
            createdAt: new Date().toISOString() 
        }),
        updatedAt: serverTimestamp()
    });
};

/**
 * Sletter et manifest permanent.
 * 
 * @param orgId - Organisasjonens ID.
 * @param manifestId - Manifestets ID.
 */
export const deleteManifest = async (orgId: string, manifestId: string): Promise<void> => {
    const docRef = doc(db, `organizations/${orgId}/manifests/${manifestId}`);
    await deleteDoc(docRef);
};

/**
 * Øker antallet lastede varer for en spesifikk ordre i manifestet.
 * 
 * Hvis alle varer i ordren er lastet, oppdateres statusen automatisk til 'loaded' 
 * både i manifestet og på selve ordredokumentet.
 * 
 * @param orgId - Organisasjonens ID.
 * @param manifestId - Manifestets ID.
 * @param orderId - Ordrens ID.
 * @param userId - ID-en til brukeren som utfører lastingen.
 * @throws Feil hvis ordren ikke finnes eller allerede er ferdiglastet.
 */
export const incrementManifestItemLoadedCount = async (
  orgId: string, 
  manifestId: string, 
  orderId: string, 
  userId: string
): Promise<void> => {
  const docRef = doc(db, `organizations/${orgId}/manifests/${manifestId}`);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) throw new Error('Manifest not found');

  const manifest = docSnap.data() as Manifest;
  const orderIndex = manifest.orders.findIndex(o => o.orderId === orderId);
  
  if (orderIndex === -1) throw new Error('Order not found in manifest');

  const currentItem = manifest.orders[orderIndex];

  if (currentItem.loadedItems < currentItem.totalItems) {
      currentItem.loadedItems += 1;
      if (currentItem.loadedItems === currentItem.totalItems) {
          currentItem.status = 'loaded';
          currentItem.loadedAt = new Date().toISOString();
          currentItem.loadedBy = userId;
          await updateOrder(orgId, orderId, { status: 'loaded' });
      }
      
      await updateDoc(docRef, {
          orders: manifest.orders,
          updatedAt: serverTimestamp()
      });
  } else {
      throw new Error(`All items for order ${orderId} have already been loaded.`);
  }
};

/**
 * Reduserer antallet lastede varer (angreoperasjon).
 * 
 * Setter status tilbake til 'pending' dersom antallet lastede varer blir mindre enn totalen.
 * 
 * @param orgId - Organisasjonens ID.
 * @param manifestId - Manifestets ID.
 * @param orderId - Ordrens ID.
 */
export const decrementManifestItemLoadedCount = async (
  orgId: string, 
  manifestId: string, 
  orderId: string
): Promise<void> => {
  const docRef = doc(db, `organizations/${orgId}/manifests/${manifestId}`);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) throw new Error('Manifest not found');

  const manifest = docSnap.data() as Manifest;
  const orderIndex = manifest.orders.findIndex(o => o.orderId === orderId);
  
  if (orderIndex === -1) throw new Error('Order not found in manifest');

  const currentItem = manifest.orders[orderIndex];

  if (currentItem.loadedItems > 0) {
      currentItem.loadedItems -= 1;
      currentItem.status = 'pending'; 
      
      delete currentItem.loadedAt;
      delete currentItem.loadedBy;

      await updateDoc(docRef, {
          orders: manifest.orders,
          updatedAt: serverTimestamp()
      });
      await updateOrder(orgId, orderId, { status: 'pending' });
  } else {
      throw new Error(`No items for order ${orderId} to unload.`);
  }
};

/**
 * Markerer et manifest som ferdig verifisert.
 * 
 * Brukes når terminalarbeideren har bekreftet at alt er lastet korrekt på bilen.
 * 
 * @param orgId - Organisasjonens ID.
 * @param manifestId - Manifestets ID.
 * @param userId - ID-en til den som verifiserer manifestet.
 */
export const finalizeManifest = async (orgId: string, manifestId: string, userId: string): Promise<void> => {
  const docRef = doc(db, `organizations/${orgId}/manifests/${manifestId}`);
  await updateDoc(docRef, {
    status: 'verified',
    verifiedAt: serverTimestamp(),
    verifiedBy: userId,
    updatedAt: serverTimestamp()
  });
};

/**
 * Prosesserer en strekkodeskan mot et manifest.
 * 
 * Denne intelligente funksjonen gjenkjenner automatisk om strekkoden tilhører:
 * 1. En hel ordre (alle underliggende kolli markeres).
 * 2. En spesifikk pall (alle kolli på pallen markeres).
 * 3. Et enkeltkolli.
 * 
 * @param orgId - Organisasjonens ID.
 * @param manifestId - Manifestets ID.
 * @param scannedBarcode - Strekkoden som ble lest av skanneren.
 * @param userId - ID-en til brukeren som skanner.
 * @returns En Promise med suksess-status og en beskrivende melding for UI.
 */
export const processManifestScan = async (
    orgId: string,
    manifestId: string,
    scannedBarcode: string,
    userId: string
): Promise<{ success: boolean; message: string }> => {
    const manifestRef = doc(db, `organizations/${orgId}/manifests/${manifestId}`);
    const manifestSnap = await getDoc(manifestRef);
    if (!manifestSnap.exists()) throw new Error('Manifest not found');
    const manifest = manifestSnap.data() as Manifest;

    // 1. Prøv først direkte match mot ordrene i manifestet
    let orderIndex = manifest.orders.findIndex(o => o.barcode === scannedBarcode || o.orderId === scannedBarcode);
    
    let matchedOrderId = null;
    let itemsToAddCount = 0;
    let idsToMarkScanned: string[] = [];

    // 2. Søk i alle ordrer tilknyttet denne ruten for å finne kolli/paller
    const ordersRef = collection(db, `organizations/${orgId}/orders`);
    const routeOrdersQuery = query(ordersRef, where('routeId', '==', manifest.routeId));
    const routeOrdersSnap = await getDocs(routeOrdersQuery);
    
    for (const orderDoc of routeOrdersSnap.docs) {
        const orderData = { ...orderDoc.data(), id: orderDoc.id } as Order;
        
        // Sjekk om skanningen er et kolli
        const collieMatch = orderData.collies?.find(c => c.id === scannedBarcode);
        if (collieMatch) {
            matchedOrderId = orderData.id;
            itemsToAddCount = 1;
            idsToMarkScanned.push(collieMatch.id);
            break;
        }

        // Sjekk om skanningen er en pall
        const palletMatch = orderData.handlingUnits?.find(h => h.id === scannedBarcode);
        if (palletMatch) {
            matchedOrderId = orderData.id;
            const associatedCollies = orderData.collies?.filter(c => c.handlingUnitId === palletMatch.id) || [];
            itemsToAddCount = associatedCollies.length;
            idsToMarkScanned = associatedCollies.map(c => c.id);
            break;
        }
    }

    // 3. Oppdater orderIndex hvis vi fant en match via kolli/pall
    if (matchedOrderId) {
        orderIndex = manifest.orders.findIndex(o => o.orderId === matchedOrderId);
    } else if (orderIndex !== -1) {
        // Funnet via direkte match mot manifestets barcode/id
        itemsToAddCount = 1;
        idsToMarkScanned.push(`SCAN-${scannedBarcode}-${Date.now()}`); 
    }

    // 4. Verifisering
    if (orderIndex === -1) {
        return { success: false, message: `Strekkoden ${scannedBarcode} ble ikke funnet i dette manifestet.` };
    }

    const currentItem = manifest.orders[orderIndex];
    
    const alreadyScanned = currentItem.scannedCollieIds || [];
    const newItems = idsToMarkScanned.filter(id => !alreadyScanned.includes(id));
    
    if (newItems.length === 0 && idsToMarkScanned.length > 0) {
        return { success: false, message: 'Denne varen er allerede registrert i manifestet.' };
    }

    // Sjekk kapasitet
    if (currentItem.loadedItems + newItems.length > currentItem.totalItems) {
        return { success: false, message: `Kan ikke legge til ${newItems.length} kolli. Ordren har kun ${currentItem.totalItems - currentItem.loadedItems} ledige plasser.` };
    }

    // Oppdater tellere og status
    currentItem.loadedItems += newItems.length;
    currentItem.scannedCollieIds = [...alreadyScanned, ...newItems];

    if (currentItem.loadedItems >= currentItem.totalItems) {
        currentItem.status = 'loaded';
        currentItem.loadedAt = new Date().toISOString();
        currentItem.loadedBy = userId;
        await updateOrder(orgId, currentItem.orderId, { status: 'loaded' });
    }

    // Lagre endringer
    await updateDoc(manifestRef, {
        orders: manifest.orders,
        updatedAt: serverTimestamp()
    });

    if (itemsToAddCount > 1) {
        return { success: true, message: `Pall registrert. ${itemsToAddCount} kolli lagt til automatisk.` };
    }
    return { success: true, message: 'Vare registrert og lastet.' };
};
