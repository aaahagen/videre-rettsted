import { collection, doc, getDoc, addDoc, updateDoc, query, where, getDocs, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Order } from '../types';

export const createOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const orgRef = doc(db, 'organizations', order.orgId);
  const ordersRef = collection(orgRef, 'orders');
  const docRef = await addDoc(ordersRef, {
    ...order,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
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
