'use client';

import { collection, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, where, getDocs, orderBy, limit, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase';
import { firebaseStorage } from './storage';
import { Database } from '../database';
import { Place, User, Organization, Route, LogEntry, Vehicle, WorkLog, ProofOfDelivery, Order, Manifest, VehicleInspection } from '../types';

export const logEvent = async (orgId: string, userId: string, action: 'create_place' | 'delete_place' | 'login', details?: any) => {
    try {
        await addDoc(collection(db, 'audit_logs'), {
            orgId,
            userId,
            action,
            details: details || {},
            timestamp: serverTimestamp()
        });
    } catch (e) {
        console.error("Failed to log event", e);
    }
};

export const getLogs = async (orgId: string): Promise<LogEntry[]> => {
    const q = query(collection(db, 'audit_logs'), where('orgId', '==', orgId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            id: doc.id,
            timestamp: data.timestamp
        } as LogEntry;
    });
};

const createOrganization = async (name: string): Promise<string> => {
  const docRef = await addDoc(collection(db, 'organizations'), { name });
  return docRef.id;
};

const getOrganization = async (orgId: string): Promise<Organization | null> => {
  const docRef = doc(db, 'organizations', orgId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { ...docSnap.data() as Organization, id: docSnap.id } : null;
};

const deleteOrganization = async (orgId: string): Promise<void> => {
    const docRef = doc(db, 'organizations', orgId);
    await deleteDoc(docRef);
};

const updateOrganization = async (orgId: string, data: Partial<Organization>): Promise<void> => {
  const docRef = doc(db, 'organizations', orgId);
  await updateDoc(docRef, data);
};

const createUser = async (uid: string, name: string, email: string, orgId: string, role: 'admin' | 'driver'): Promise<void> => {
  await setDoc(doc(db, 'users', uid), { name, email, orgId, role, favorites: [] });
};

const getUser = async (uid: string): Promise<User | null> => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { ...docSnap.data() as User, id: docSnap.id } : null;
};

const getUsers = async (orgId: string): Promise<User[]> => {
  const q = query(collection(db, 'users'), where('orgId', '==', orgId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return { ...data, id: doc.id } as User;
  });
};

const updateUser = async (uid: string, data: Partial<User>): Promise<void> => {
  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, data);
};

const deleteUser = async (uid: string): Promise<void> => {
    const docRef = doc(db, 'users', uid);
    await deleteDoc(docRef);
};

const createPlace = async (place: Omit<Place, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<Place> => {
  const user = auth.currentUser;
  if (!user) throw new Error("User must be logged in to create a place");

  const docRef = await addDoc(collection(db, 'places'), {
    ...place,
    createdBy: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Log event
  const orgId = place.orgId || place.organizationId;
  const authorId = user.uid;
  
  if (orgId && authorId) {
      logEvent(orgId, authorId, 'create_place', { placeId: docRef.id, name: place.name });
  }

  return { ...place, id: docRef.id } as Place;
};

const getPlace = async (id: string): Promise<Place | null> => {
  const docRef = doc(db, 'places', id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    ...data,
    id: docSnap.id,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
  } as Place;
};

const getPlaces = async (orgId: string): Promise<Place[]> => {
  const q = query(collection(db, 'places'), where('orgId', '==', orgId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    } as Place;
  });
};

const updatePlace = async (id: string, updates: Partial<Place>): Promise<Place> => {
  const user = auth.currentUser;
  if (!user) throw new Error("User must be logged in to update a place");
  const docRef = doc(db, 'places', id);
  await updateDoc(docRef, {
    ...updates,
    updatedBy: user.uid,
    updatedAt: serverTimestamp(),
  });
  const updated = await getDoc(docRef);
  const data = updated.data()!;
  return {
    ...data,
    id: updated.id,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
  } as Place;
};

const deletePlace = async (id: string): Promise<void> => {
  const docRef = doc(db, 'places', id);
  
  // Fetch place before delete to log event and get image URLs
  const placeSnap = await getDoc(docRef);
  if (placeSnap.exists()) {
      const placeData = placeSnap.data() as Place;
      const currentUser = auth.currentUser;
      const orgId = placeData.orgId || placeData.organizationId;
      
      // 1. Delete associated images from Firebase Storage
      if (placeData.images && Array.isArray(placeData.images)) {
          for (const image of placeData.images) {
              if (image.url && !image.url.includes('placeholder')) {
                  try {
                      // Attempt to delete using the URL directly, or extract the path if needed by your storage class.
                      // Usually FirebaseStorage.deleteFile expects a path. If you only have a download URL, 
                      // you can create a ref from the URL in firebase storage, but your wrapper takes a path.
                      // Let's use the standard firebase/storage method directly for safety here to parse the URL.
                      const { ref, getStorage } = await import('firebase/storage');
                      const storageRef = ref(getStorage(), image.url);
                      const { deleteObject } = await import('firebase/storage');
                      await deleteObject(storageRef);
                  } catch (imgError) {
                      console.error(`Failed to delete image ${image.url} for place ${id}:`, imgError);
                      // Continue deleting the place even if an image fails (e.g., already deleted)
                  }
              }
          }
      }

      // 2. Log event
      if (currentUser && orgId) {
          logEvent(orgId, currentUser.uid, 'delete_place', { placeId: id, name: placeData.name });
      }
  }

  // 3. Delete the document
  await deleteDoc(docRef);
};

// Route methods
const getRoute = async (id: string): Promise<Route | null> => {
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

const getRoutes = async (orgId: string): Promise<Route[]> => {
  const q = query(collection(db, 'routes'), where('orgId', '==', orgId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    } as Route;
  });
};

const createRoute = async (route: Omit<Route, 'id' | 'createdAt' | 'updatedAt'>): Promise<Route> => {
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

const updateRoute = async (id: string, updates: Partial<Route>): Promise<Route> => {
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

const deleteRoute = async (id: string): Promise<void> => {
  const docRef = doc(db, 'routes', id);
  await deleteDoc(docRef);
};


// Vehicle methods
const createVehicle = async (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle> => {
  const docRef = await addDoc(collection(db, 'vehicles'), {
    ...vehicle,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return {
    ...vehicle,
    id: docRef.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Vehicle;
};

const getVehicle = async (id: string): Promise<Vehicle | null> => {
  const docRef = doc(db, 'vehicles', id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    ...data,
    id: docSnap.id,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
  } as Vehicle;
};

const getVehicles = async (orgId: string): Promise<Vehicle[]> => {
  const q = query(collection(db, 'vehicles'), where('orgId', '==', orgId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    } as Vehicle;
  });
};

const updateVehicle = async (id: string, updates: Partial<Vehicle>): Promise<Vehicle> => {
  const docRef = doc(db, 'vehicles', id);
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
  } as Vehicle;
};

const deleteVehicle = async (id: string): Promise<void> => {
  const docRef = doc(db, 'vehicles', id);
  await deleteDoc(docRef);
};

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

export const markPlaceVisited = async (userId: string, placeId: string) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { visitedPlaces: arrayUnion(placeId) });
};


// --- WorkLogs ---

const createWorkLog = async (workLog: Omit<WorkLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkLog> => {
  const docRef = await addDoc(collection(db, 'workLogs'), {
    ...workLog,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  const docSnap = await getDoc(docRef);
  return { id: docSnap.id, ...docSnap.data() } as WorkLog;
};

const getWorkLog = async (id: string): Promise<WorkLog | null> => {
  const docRef = doc(db, 'workLogs', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as WorkLog;
  }
  return null;
};

const createLogEntry = async (logEntry: Omit<LogEntry, "id" | "timestamp">): Promise<string> => {
  const docRef = await addDoc(collection(db, "logs"), {
    ...logEntry,
    timestamp: serverTimestamp(),
  });
  return docRef.id;
};

// TODO: Cronjob should delete stamps (workLogs) after 3-5 years

const getWorkLogsForDriver = async (driverId: string, startDate?: string, endDate?: string): Promise<WorkLog[]> => {
  let q = query(collection(db, 'workLogs'), where('driverId', '==', driverId));
  
  if (startDate) {
      q = query(q, where('actualPunchIn', '>=', startDate));
  }
  if (endDate) {
      q = query(q, where('actualPunchIn', '<=', endDate + 'T23:59:59Z'));
  }
  
  q = query(q, orderBy('actualPunchIn', 'desc'));

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkLog));
};

const getWorkLogsForOrganization = async (orgId: string, status?: WorkLog['status']): Promise<WorkLog[]> => {
  let q = query(collection(db, 'workLogs'), where('orgId', '==', orgId));
  
  if (status) {
      q = query(q, where('status', '==', status));
  }
  
  q = query(q, orderBy('actualPunchIn', 'desc'));

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkLog));
};

const updateWorkLog = async (id: string, updates: Partial<WorkLog>): Promise<WorkLog> => {
  const docRef = doc(db, 'workLogs', id);
  await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
  return getWorkLog(id) as Promise<WorkLog>;
};

const deleteWorkLog = async (id: string): Promise<void> => {
  const docRef = doc(db, 'workLogs', id);
  await deleteDoc(docRef);
};


// --- Phase 3: Verification Methods ---

const createOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const orgRef = doc(db, 'organizations', order.orgId);
  const ordersRef = collection(orgRef, 'orders');
  const docRef = await addDoc(ordersRef, {
    ...order,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

const getOrder = async (orgId: string, orderId: string): Promise<Order | null> => {
  const docRef = doc(db, `organizations/${orgId}/orders/${orderId}`);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Order;
};

const getOrdersForRoute = async (orgId: string, routeId: string): Promise<Order[]> => {
  const ordersRef = collection(db, `organizations/${orgId}/orders`);
  const q = query(ordersRef, where('routeId', '==', routeId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
};

const updateOrderStatus = async (orgId: string, orderId: string, status: Order['status']): Promise<void> => {
  const docRef = doc(db, `organizations/${orgId}/orders/${orderId}`);
  await updateDoc(docRef, { status, updatedAt: serverTimestamp() });
};

const createManifest = async (manifest: Omit<Manifest, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const orgRef = doc(db, 'organizations', manifest.orgId);
  const manifestsRef = collection(orgRef, 'manifests');
  const docRef = await addDoc(manifestsRef, {
    ...manifest,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

const getManifestByRoute = async (orgId: string, routeId: string): Promise<Manifest | null> => {
  const manifestsRef = collection(db, `organizations/${orgId}/manifests`);
  const q = query(manifestsRef, where('routeId', '==', routeId), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as Manifest;
};

const verifyManifestItem = async (orgId: string, manifestId: string, orderId: string, userId: string): Promise<void> => {
  const docRef = doc(db, `organizations/${orgId}/manifests/${manifestId}`);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) throw new Error('Manifest not found');

  const manifest = docSnap.data() as Manifest;
  const orderIndex = manifest.orders.findIndex(o => o.orderId === orderId);
  
  if (orderIndex === -1) throw new Error('Order not found in manifest');

  manifest.orders[orderIndex].status = 'loaded';
  manifest.orders[orderIndex].loadedAt = serverTimestamp() as any;
  manifest.orders[orderIndex].loadedBy = userId;

  await updateDoc(docRef, {
    orders: manifest.orders,
    updatedAt: serverTimestamp()
  });

  await updateOrderStatus(orgId, orderId, 'loaded');
};

const finalizeManifest = async (orgId: string, manifestId: string, userId: string): Promise<void> => {
  const docRef = doc(db, `organizations/${orgId}/manifests/${manifestId}`);
  await updateDoc(docRef, {
    status: 'verified',
    verifiedAt: serverTimestamp(),
    verifiedBy: userId,
    updatedAt: serverTimestamp()
  });
};

const submitProofOfDelivery = async (orgId: string, routeId: string, placeId: string, pod: ProofOfDelivery): Promise<void> => {
  const routeRef = doc(db, `organizations/${orgId}/routes/${routeId}`);
  
  await updateDoc(routeRef, {
    [`completedStopEvents.${placeId}.pod`]: pod,
    updatedAt: serverTimestamp()
  });
};

const submitVehicleInspection = async (inspection: Omit<VehicleInspection, 'id'>): Promise<string> => {
  const orgRef = doc(db, 'organizations', inspection.orgId);
  const inspectionsRef = collection(orgRef, 'vehicleInspections');
  const docRef = await addDoc(inspectionsRef, {
    ...inspection,
    timestamp: serverTimestamp(),
  });
  return docRef.id;
};

const getVehicleInspections = async (orgId: string, vehicleId: string): Promise<VehicleInspection[]> => {
  const inspectionsRef = collection(db, `organizations/${orgId}/vehicleInspections`);
  const q = query(inspectionsRef, where('vehicleId', '==', vehicleId), orderBy('timestamp', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VehicleInspection));
};

export const firebaseDB: Database = {
  createOrganization,
  getOrganization,
  deleteOrganization,
  updateOrganization,
  createUser,
  getUser,
  getUsers,
  updateUser,
  deleteUser,
  createPlace,
  getPlace,
  getPlaces,
  updatePlace,
  deletePlace,
  getRoute,
  getRoutes,
  createRoute,
  updateRoute,
  deleteRoute,
  createVehicle,
  getVehicle,
  getVehicles,
  updateVehicle,
  deleteVehicle,
  createWorkLog,
  getWorkLog,
  createLogEntry,
  getWorkLogsForDriver,
  getWorkLogsForOrganization,
  updateWorkLog,
  deleteWorkLog,

  createOrder, getOrder, getOrdersForRoute, updateOrderStatus,
  createManifest, getManifestByRoute, verifyManifestItem, finalizeManifest,
  submitProofOfDelivery, submitVehicleInspection, getVehicleInspections,
};