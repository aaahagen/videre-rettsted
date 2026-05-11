import { collection, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, getDocs, orderBy, serverTimestamp, writeBatch, arrayRemove, limit } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Order, Collie, HandlingUnit, Manifest, Route } from '../types';
import { calculateVolumetrics } from '../volumetrics';

/**
 * Initialiserer og lagrer en ny ordre i organisasjonens ordresystem.
 * 
 * Denne arkitektoniske funksjonen utfører tre kritiske operasjoner:
 * 1. Beregner volumetrisk behov (antall paller) basert på varelinjer.
 * 2. Genererer unike strekkoder for hvert enkelt kolli (Collie) for full sporbarhet.
 * 3. Oppretter handling units (paller) og knytter kolliene til disse via en round-robin logikk.
 * 
 * @param order - Ordreobjektet som skal lagres. Bruker `Omit` for å sikre at `id` og tidsstempler genereres av databasen.
 * @returns En Promise som løses med den autogenererte dokument-ID-en fra Firestore.
 * @throws Kan kaste feil ved nettverksbrudd eller manglende skrivetilgang til organisasjonens subcollection.
 * 
 * @example
 * ```typescript
 * const newOrderId = await createOrder({
 *   orgId: "org_123",
 *   barcode: "ORD-999",
 *   placeId: "loc_456",
 *   status: "pending",
 *   lineItems: [{ id: "item_1", name: "Pakke", quantity: 5, weight: 10 }]
 * });
 * console.log(`Ordre opprettet med ID: ${newOrderId}`);
 * ```
 */
export const createOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const orgRef = doc(db, 'organizations', order.orgId);
  const ordersRef = collection(orgRef, 'orders');
  
  // 1. Beregn antall paller basert på volumetrisk vekt/volum
  let handlingUnits: HandlingUnit[] = [];
  let estimatedPalletsCount = 0;
  
  if (order.lineItems && order.lineItems.length > 0) {
      const vol = calculateVolumetrics(order.lineItems);
      estimatedPalletsCount = Math.ceil(vol.estimatedPallets); 
      
      for (let i = 0; i < estimatedPalletsCount; i++) {
          handlingUnits.push({
              id: `${order.barcode}-P${i + 1}`,
              type: 'eur-pallet',
              status: 'pending'
          });
      }
  }

  // 2. Generer individuelle kolli basert på varelinje-antall
  let collies: Collie[] = [];
  let itemCounter = 1;
  
  if (order.lineItems) {
      for (const lineItem of order.lineItems) {
          for (let i = 0; i < lineItem.quantity; i++) {
              
              // Tildel kolli til en pall via round-robin
              let assignedPalletId = undefined;
              if (handlingUnits.length > 0) {
                  const palletIndex = (itemCounter - 1) % handlingUnits.length;
                  assignedPalletId = handlingUnits[palletIndex].id;
              }

              collies.push({
                  id: `${order.barcode}-${itemCounter.toString().padStart(3, '0')}`,
                  lineItemId: lineItem.id,
                  handlingUnitId: assignedPalletId,
                  status: 'pending'
              });
              itemCounter++;
          }
      }
  }

  // 3. Lagre til databasen
  const orderToSave = {
    ...order,
    collies: collies.length > 0 ? collies : order.collies,
    handlingUnits: handlingUnits.length > 0 ? handlingUnits : order.handlingUnits,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(ordersRef, orderToSave);
  return docRef.id;
};

/**
 * Hurtigregistrering av en pakke fra tredjepart. Oppretter en "shell"-ordre eller oppdaterer eksisterende.
 * 
 * Brukes primært på terminalen/lasterampen når en sjåfør ankommer med uforutsette pakker som må spores.
 * 
 * @param data - Inneholder organisasjons-ID, strekkode og valgfrie rute/sted-identifikatorer.
 * @returns En Promise som returnerer ordre-ID og en boolsk verdi som indikerer om ordren var ny.
 * 
 * @example
 * ```typescript
 * const result = await ingestThirdPartyPackage({
 *   orgId: "org_abc",
 *   barcode: "3PS-12345",
 *   routeId: "route_morgen"
 * });
 * ```
 */
export const ingestThirdPartyPackage = async (data: {
  orgId: string;
  barcode: string;
  routeId?: string;
  placeId?: string;
  senderName?: string;
  recipientName?: string;
}): Promise<{ orderId: string, isNew: boolean }> => {
  const ordersRef = collection(db, `organizations/${data.orgId}/orders`);
  
  // Sjekk om ordre med denne strekkoden allerede eksisterer
  const q = query(ordersRef, where('barcode', '==', data.barcode), limit(1));
  const snap = await getDocs(q);
  
  if (!snap.empty) {
    const existingOrder = snap.docs[0];
    const updateData: any = {
      updatedAt: serverTimestamp()
    };
    if (data.routeId) updateData.routeId = data.routeId;
    if (data.placeId) updateData.placeId = data.placeId;
    
    await updateDoc(existingOrder.ref, updateData);
    return { orderId: existingOrder.id, isNew: false };
  }

  // Opprett shell-ordre
  const newOrder: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
    orgId: data.orgId,
    barcode: data.barcode,
    placeId: data.placeId || 'pending_hub',
    status: 'pending',
    details: {
      description: `Inngående 3. part: ${data.barcode}${data.senderName ? ` fra ${data.senderName}` : ''}`,
      numberOfItems: 1
    },
    routeId: data.routeId || undefined,
    collies: [{
      id: data.barcode,
      lineItemId: '3ps-shell',
      status: 'pending'
    }]
  };

  const id = await createOrder(newOrder);
  return { orderId: id, isNew: true };
};

/**
 * Henter en spesifikk ordre basert på organisasjons-ID og ordre-ID.
 * 
 * @param orgId - Den unike ID-en til organisasjonen.
 * @param orderId - Dokument-ID-en til ordren.
 * @returns En Promise med `Order`-objektet eller `null` hvis den ikke finnes.
 */
export const getOrder = async (orgId: string, orderId: string): Promise<Order | null> => {
  const docRef = doc(db, `organizations/${orgId}/orders/${orderId}`);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Order;
};

/**
 * Henter alle ordrer for en gitt organisasjon, sortert etter opprettelsesdato (nyeste først).
 * 
 * @param orgId - Den unike ID-en til organisasjonen.
 * @returns En Promise med en liste over alle ordrer.
 */
export const getOrders = async (orgId: string): Promise<Order[]> => {
  const ordersRef = collection(db, `organizations/${orgId}/orders`);
  const q = query(ordersRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
};

/**
 * Henter alle ordrer som er tildelt en spesifikk rute.
 * 
 * @param orgId - Organisasjonens ID.
 * @param routeId - Identifikatoren til ruten.
 * @returns En Promise med listen over ordrer på ruten.
 */
export const getOrdersForRoute = async (orgId: string, routeId: string): Promise<Order[]> => {
  const ordersRef = collection(db, `organizations/${orgId}/orders`);
  const q = query(ordersRef, where('routeId', '==', routeId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
};

/**
 * Oppdaterer kun statusen på en ordre.
 * 
 * @param orgId - Organisasjonens ID.
 * @param orderId - Ordrens ID.
 * @param status - Den nye statusverdien (f.eks. 'picked_up', 'delivered').
 */
export const updateOrderStatus = async (orgId: string, orderId: string, status: Order['status']): Promise<void> => {
  const docRef = doc(db, `organizations/${orgId}/orders/${orderId}`);
  await updateDoc(docRef, { status, updatedAt: serverTimestamp() });
};

/**
 * Utfører en delvis oppdatering av et ordreobjekt.
 * 
 * @param orgId - Organisasjonens ID.
 * @param orderId - Ordrens ID.
 * @param updates - Objektet som inneholder feltene som skal endres.
 */
export const updateOrder = async (orgId: string, orderId: string, updates: Partial<Order>): Promise<void> => {
  const docRef = doc(db, `organizations/${orgId}/orders/${orderId}`);
  await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
};

/**
 * Sletter en ordre permanent og håndterer kaskadeoppdateringer for tilhørende ruter og manifester.
 * 
 * Funksjonen utfører følgende:
 * 1. Fjerner referansen til ordren fra tilknyttede ruter.
 * 2. Oppdaterer tilknyttede manifester for å reflektere fjerningen.
 * 3. Sletter selve ordredokumentet.
 * 
 * @param orgId - Organisasjonens ID.
 * @param orderId - Ordrens ID som skal slettes.
 * @throws Feil ved databaseoperasjoner.
 */
export const deleteOrder = async (orgId: string, orderId: string): Promise<void> => {
  const batch = writeBatch(db);
  const orderRef = doc(db, `organizations/${orgId}/orders/${orderId}`);
  
  try {
    const orderSnap = await getDoc(orderRef);
    if (!orderSnap.exists()) return;
    
    const orderData = orderSnap.data() as Order;
    const { routeId, placeId } = orderData;

    // 1. Fjern ordre fra tilknyttet rute
    if (routeId) {
      const routeRef = doc(db, 'routes', routeId);
      const routeSnap = await getDoc(routeRef);
      
      if (routeSnap.exists()) {
        const routeData = routeSnap.data() as Route;
        
        // Sjekk om andre ordrer på samme rute peker til samme leveringssted
        const otherOrdersInRouteQ = query(
          collection(db, `organizations/${orgId}/orders`),
          where('routeId', '==', routeId),
          where('__name__', '!=', orderId)
        );
        const otherOrdersSnap = await getDocs(otherOrdersInRouteQ);
        const placeStillNeeded = otherOrdersSnap.docs.some(d => (d.data() as Order).placeId === placeId);

        // Hvis ingen andre ordrer på ruten trenger dette stedet, fjern stoppestedet fra ruten
        if (!placeStillNeeded) {
          batch.update(routeRef, {
            places: arrayRemove(placeId),
            completedStops: arrayRemove(placeId)
          });
        }
      }

      // 2. Fjern ordre fra tilknyttet manifest
      const manifestQ = query(
        collection(db, `organizations/${orgId}/manifests`),
        where('routeId', '==', routeId),
        limit(1)
      );
      const manifestSnap = await getDocs(manifestQ);
      
      if (!manifestSnap.empty) {
        const manifestDoc = manifestSnap.docs[0];
        const manifestData = manifestDoc.data() as Manifest;
        const updatedOrders = manifestData.orders.filter(o => o.orderId !== orderId);
        
        batch.update(manifestDoc.ref, {
          orders: updatedOrders,
          updatedAt: serverTimestamp()
        });
      }
    }

    // 3. Slett selve ordredokumentet
    batch.delete(orderRef);

    // Utfør alle endringene atomært
    await batch.commit();
  } catch (error) {
    console.error("Feil ved kaskadesletting av ordre:", error);
    throw error;
  }
};
