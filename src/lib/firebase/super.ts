import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where, getCountFromServer, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Organization, User } from '../types';

export const superDB = {
  // Organizations
  getAllOrganizations: async (): Promise<Organization[]> => {
    const q = query(collection(db, 'organizations'), orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data() as Organization, id: doc.id }));
  },

  updateOrganizationModules: async (orgId: string, modules: Organization['modules']): Promise<void> => {
    const docRef = doc(db, 'organizations', orgId);
    await updateDoc(docRef, { modules });
  },

  updateOrganizationStatus: async (orgId: string, status: Organization['status']): Promise<void> => {
    const docRef = doc(db, 'organizations', orgId);
    await updateDoc(docRef, { status });
  },
  
  updateOrganizationDetails: async (orgId: string, data: Partial<Organization>): Promise<void> => {
    const docRef = doc(db, 'organizations', orgId);
    await updateDoc(docRef, data);
  },

  deleteOrganizationHard: async (orgId: string): Promise<void> => {
    const docRef = doc(db, 'organizations', orgId);
    await deleteDoc(docRef);
  },

  // Context Switching for Super Admins
  switchToOrganization: async (userId: string, orgId: string): Promise<void> => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { orgId });
  },

  // Users Across All Orgs (Global View)
  getGlobalPlatformStats: async () => {
    const usersSnap = await getCountFromServer(collection(db, 'users'));
    const placesSnap = await getCountFromServer(collection(db, 'places'));
    // Routes are soft-deleted or kept as completed. We count all completed routes historically across the platform.
    const routesQ = query(collection(db, 'routes'), where('status', '==', 'completed'));
    const completedRoutesSnap = await getCountFromServer(routesQ);

    return {
        totalUsers: usersSnap.data().count,
        totalPlaces: placesSnap.data().count,
        completedRoutes: completedRoutesSnap.data().count,
    };
  },

  getGlobalUserStats: async () => {
    const snapshot = await getDocs(collection(db, 'users'));
    return {
        total: snapshot.size,
        admins: snapshot.docs.filter(d => d.data().role === 'admin').length,
        drivers: snapshot.docs.filter(d => d.data().role === 'driver').length,
    };
  },

  // Analytics per organization
  sendGlobalBroadcast: async (senderId: string, content: string): Promise<void> => {
    const q = query(collection(db, 'organizations'));
    const orgsSnap = await getDocs(q);
    
    const batch = writeBatch(db);
    
    orgsSnap.docs.forEach((orgDoc) => {
      const orgId = orgDoc.id;
      const newMsgRef = doc(collection(doc(db, 'organizations', orgId), 'messages'));
      batch.set(newMsgRef, {
        orgId,
        senderId,
        recipientId: 'all',
        content,
        createdAt: serverTimestamp(),
        readBy: [],
        type: 'broadcast'
      });
    });

    await batch.commit();
  },

  getOrgStats: async (orgId: string) => {
    try {
      const usersQ = query(collection(db, 'users'), where('orgId', '==', orgId));
      const placesQ = query(collection(db, 'places'), where('orgId', '==', orgId));
      const vehiclesQ = query(collection(db, 'vehicles'), where('orgId', '==', orgId));
      
      const ordersQ = query(collection(doc(db, 'organizations', orgId), 'orders'));

      const [usersSnap, placesSnap, vehiclesSnap, ordersSnap] = await Promise.all([
        getCountFromServer(usersQ),
        getCountFromServer(placesQ),
        getCountFromServer(vehiclesQ),
        getCountFromServer(ordersQ)
      ]);

      return {
        users: usersSnap.data().count,
        places: placesSnap.data().count,
        vehicles: vehiclesSnap.data().count,
        orders: ordersSnap.data().count
      };
    } catch (error) {
      console.error(`Error getting stats for org ${orgId}`, error);
      return {
        users: 0,
        places: 0,
        vehicles: 0,
        orders: 0
      };
    }
  }
};
