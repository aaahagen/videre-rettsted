import { collection, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, getDocs, orderBy, serverTimestamp, writeBatch, arrayRemove, limit } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Order, Collie, HandlingUnit, Manifest, Route } from '../types';
import { calculateVolumetrics } from '../volumetrics';

export const createOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const orgRef = doc(db, 'organizations', order.orgId);
  const ordersRef = collection(orgRef, 'orders');
  
  // 1. Calculate how many handling units (pallets) are needed based on volumetrics
  let handlingUnits: HandlingUnit[] = [];
  let estimatedPalletsCount = 0;
  
  if (order.lineItems && order.lineItems.length > 0) {
      const vol = calculateVolumetrics(order.lineItems);
      estimatedPalletsCount = Math.ceil(vol.estimatedPallets); // e.g. 1.2 -> 2 pallets
      
      for (let i = 0; i < estimatedPalletsCount; i++) {
          handlingUnits.push({
              id: `${order.barcode}-P${i + 1}`,
              type: 'eur-pallet',
              status: 'pending'
          });
      }
  }

  // 2. Generate individual Collies (Items) based on line item quantities
  let collies: Collie[] = [];
  let itemCounter = 1;
  
  if (order.lineItems) {
      for (const lineItem of order.lineItems) {
          for (let i = 0; i < lineItem.quantity; i++) {
              
              // Simple round-robin assignment to pallets (Handling Units)
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

  // 3. Save to database
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

export const getOrder = async (orgId: string, orderId: string): Promise<Order | null> => {
  const docRef = doc(db, `organizations/${orgId}/orders/${orderId}`);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Order;
};

export const getOrders = async (orgId: string): Promise<Order[]> => {
  const ordersRef = collection(db, `organizations/${orgId}/orders`);
  const q = query(ordersRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
};

export const getOrdersForRoute = async (orgId: string, routeId: string): Promise<Order[]> => {
  const ordersRef = collection(db, `organizations/${orgId}/orders`);
  const q = query(ordersRef, where('routeId', '==', routeId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
};

export const updateOrderStatus = async (orgId: string, orderId: string, status: Order['status']): Promise<void> => {
  const docRef = doc(db, `organizations/${orgId}/orders/${orderId}`);
  await updateDoc(docRef, { status, updatedAt: serverTimestamp() });
};

export const updateOrder = async (orgId: string, orderId: string, updates: Partial<Order>): Promise<void> => {
  const docRef = doc(db, `organizations/${orgId}/orders/${orderId}`);
  await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
};

/**
 * Deletes an order and handles cascading updates for routes and manifests.
 */
export const deleteOrder = async (orgId: string, orderId: string): Promise<void> => {
  const batch = writeBatch(db);
  const orderRef = doc(db, `organizations/${orgId}/orders/${orderId}`);
  
  try {
    const orderSnap = await getDoc(orderRef);
    if (!orderSnap.exists()) return;
    
    const orderData = orderSnap.data() as Order;
    const { routeId, placeId } = orderData;

    // 1. Remove order from any associated Route
    if (routeId) {
      const routeRef = doc(db, 'routes', routeId);
      const routeSnap = await getDoc(routeRef);
      
      if (routeSnap.exists()) {
        const routeData = routeSnap.data() as Route;
        
        // Check if other orders on the same route point to the same place
        const otherOrdersInRouteQ = query(
          collection(db, `organizations/${orgId}/orders`),
          where('routeId', '==', routeId),
          where('__name__', '!=', orderId)
        );
        const otherOrdersSnap = await getDocs(otherOrdersInRouteQ);
        const placeStillNeeded = otherOrdersSnap.docs.some(d => (d.data() as Order).placeId === placeId);

        // If no other order on this route needs this place, remove the place from the route
        if (!placeStillNeeded) {
          batch.update(routeRef, {
            places: arrayRemove(placeId),
            completedStops: arrayRemove(placeId)
          });
        }
      }

      // 2. Remove order from any associated Manifest
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

    // 3. Delete the order document itself
    batch.delete(orderRef);

    // Commit all changes
    await batch.commit();
  } catch (error) {
    console.error("Error in cascading order deletion:", error);
    throw error;
  }
};
