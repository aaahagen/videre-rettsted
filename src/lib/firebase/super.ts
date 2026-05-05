import { collection, getDocs, doc, updateDoc, query, orderBy, limit } from 'firebase/firestore';
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

  // Context Switching for Super Admins
  switchToOrganization: async (userId: string, orgId: string): Promise<void> => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { orgId });
  },

  // Users Across All Orgs (Global View)
  getGlobalUserStats: async () => {
    const snapshot = await getDocs(collection(db, 'users'));
    return {
        total: snapshot.size,
        admins: snapshot.docs.filter(d => d.data().role === 'admin').length,
        drivers: snapshot.docs.filter(d => d.data().role === 'driver').length,
    };
  }
};
