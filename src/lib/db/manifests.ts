import { collection, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, getDocs, orderBy, limit, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Manifest, Order, ManifestNote } from '../types';
import { updateOrder } from './orders'; // Assuming updateOrder is now in orders.ts

export const createManifest = async (manifest: Omit<Manifest, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const orgRef = doc(db, 'organizations', manifest.orgId);
    const manifestsRef = collection(orgRef, 'manifests');

    // Ensure totalItems and loadedItems are initialized for each order
    const ordersWithInitializedCounts = manifest.orders.map(orderItem => ({
        ...orderItem,
        totalItems: orderItem.totalItems || 1, // Default to 1 if not specified
        loadedItems: 0, // Always start at 0
        status: 'pending' as const, // Ensure initial status is pending
    }));

    const docRef = await addDoc(manifestsRef, {
        ...manifest,
        orders: ordersWithInitializedCounts,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
};

export const getManifestByRoute = async (orgId: string, routeId: string): Promise<Manifest | null> => {
  const manifestsRef = collection(db, `organizations/${orgId}/manifests`);
  const q = query(manifestsRef, where('routeId', '==', routeId), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as Manifest;
};

export const updateManifest = async (orgId: string, manifestId: string, updates: Partial<Manifest>): Promise<void> => {
  const docRef = doc(db, `organizations/${orgId}/manifests/${manifestId}`);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const addManifestNote = async (orgId: string, manifestId: string, note: Omit<ManifestNote, 'createdAt'>): Promise<void> => {
    const docRef = doc(db, `organizations/${orgId}/manifests/${manifestId}`);
    await updateDoc(docRef, {
        notes: arrayUnion({
            ...note,
            createdAt: new Date().toISOString() // Use ISO string for consistency in the array
        }),
        updatedAt: serverTimestamp()
    });
};

export const deleteManifest = async (orgId: string, manifestId: string): Promise<void> => {
    const docRef = doc(db, `organizations/${orgId}/manifests/${manifestId}`);
    await deleteDoc(docRef);
};

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
          currentItem.loadedAt = serverTimestamp() as any;
          currentItem.loadedBy = userId;
          // Optionally update the main order status if all items are loaded
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
      currentItem.status = 'pending'; // Revert to pending if items are unloaded
      currentItem.loadedAt = undefined; // Clear loadedAt if items are unloaded
      currentItem.loadedBy = undefined; // Clear loadedBy if items are unloaded

      await updateDoc(docRef, {
          orders: manifest.orders,
          updatedAt: serverTimestamp()
      });
      // Optionally update the main order status if items are unloaded
      await updateOrder(orgId, orderId, { status: 'pending' });
  } else {
      throw new Error(`No items for order ${orderId} to unload.`);
  }
};

export const finalizeManifest = async (orgId: string, manifestId: string, userId: string): Promise<void> => {
  const docRef = doc(db, `organizations/${orgId}/manifests/${manifestId}`);
  await updateDoc(docRef, {
    status: 'verified',
    verifiedAt: serverTimestamp(),
    verifiedBy: userId,
    updatedAt: serverTimestamp()
  });
};


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

    // 1. Is it a general order barcode?
    let orderIndex = manifest.orders.findIndex(o => o.barcode === scannedBarcode);
    
    // 2. If not, we check if it's a Collie or Pallet by fetching the orders and checking their contents.
    // For performance in a real app, this should be indexed or the manifest should store the child IDs.
    // Given the architecture, let's search through the orders belonging to this manifest.
    let matchedOrderId = null;
    let itemsToAddCount = 0;
    let idsToMarkScanned: string[] = [];

    const ordersRef = collection(db, `organizations/${orgId}/orders`);
    const routeOrdersQuery = query(ordersRef, where('routeId', '==', manifest.routeId));
    const routeOrdersSnap = await getDocs(routeOrdersQuery);
    
    for (const orderDoc of routeOrdersSnap.docs) {
        const orderData = orderDoc.data() as Order;
        
        // Did they scan a specific Collie?
        const collieMatch = orderData.collies?.find(c => c.id === scannedBarcode);
        if (collieMatch) {
            matchedOrderId = orderData.id;
            itemsToAddCount = 1;
            idsToMarkScanned.push(collieMatch.id);
            break;
        }

        // Did they scan a whole Pallet?
        const palletMatch = orderData.handlingUnits?.find(h => h.id === scannedBarcode);
        if (palletMatch) {
            matchedOrderId = orderData.id;
            // Find all collies belonging to this pallet
            const associatedCollies = orderData.collies?.filter(c => c.handlingUnitId === palletMatch.id) || [];
            itemsToAddCount = associatedCollies.length;
            idsToMarkScanned = associatedCollies.map(c => c.id);
            break;
        }
    }

    // If we found a specific item/pallet match, update the index
    if (matchedOrderId) {
        orderIndex = manifest.orders.findIndex(o => o.orderId === matchedOrderId);
    } else if (orderIndex !== -1) {
        // They scanned the general order barcode. Just add 1.
        itemsToAddCount = 1;
        idsToMarkScanned.push(`GENERIC-${Date.now()}`); 
    }

    if (orderIndex === -1) {
        return { success: false, message: `Strekkoden ${scannedBarcode} tilhører ikke denne ruten.` };
    }

    const currentItem = manifest.orders[orderIndex];
    
    // Check if these specific items were already scanned (prevent double scanning of pallet)
    const alreadyScanned = currentItem.scannedCollieIds || [];
    const newItems = idsToMarkScanned.filter(id => !alreadyScanned.includes(id));
    
    if (newItems.length === 0 && idsToMarkScanned.length > 0) {
        return { success: false, message: 'Dette kolliet/pallen er allerede scannet.' };
    }

    if (currentItem.loadedItems + newItems.length > currentItem.totalItems) {
        // If they scan generic repeatedly beyond the total
        return { success: false, message: 'Antall lastede varer vil overstige totalen for denne ordren.' };
    }

    // Apply the updates
    currentItem.loadedItems += newItems.length;
    currentItem.scannedCollieIds = [...alreadyScanned, ...newItems];

    if (currentItem.loadedItems >= currentItem.totalItems) {
        currentItem.status = 'loaded';
        currentItem.loadedAt = serverTimestamp() as any;
        currentItem.loadedBy = userId;
        await updateOrder(orgId, currentItem.orderId, { status: 'loaded' });
    }

    await updateDoc(manifestRef, {
        orders: manifest.orders,
        updatedAt: serverTimestamp()
    });

    if (itemsToAddCount > 1) {
        return { success: true, message: `Pall scannet. ${itemsToAddCount} kolli lagt til automatisk.` };
    }
    return { success: true, message: 'Vare scannet og lastet.' };
};
