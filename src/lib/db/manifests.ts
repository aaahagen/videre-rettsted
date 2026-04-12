import { collection, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, getDocs, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Manifest, Order } from '../types';
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
