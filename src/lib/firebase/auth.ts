import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, sendPasswordResetEmail, updateProfile as firebaseUpdateProfile, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { doc, setDoc, addDoc, collection, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, functions } from './firebase';
import { httpsCallable } from 'firebase/functions';
import { UserProfile } from '../types'; 

const deleteUserCallable = httpsCallable(functions, 'deleteUser');

export const firebaseAuth = {
  async registerOrganization(email: string, password: string, organizationName: string, name: string, orgNumber: string) {
    // 1. Create user with email/password in Firebase Auth.
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // 2. Create an organization document in Firestore, now logging DPA acceptance.
    const orgRef = await addDoc(collection(db, 'organizations'), {
      name: organizationName,
      orgNumber: orgNumber || null,
      createdAt: serverTimestamp(),
      legal: {
        dpaAcceptedAt: serverTimestamp(),
        dpaAcceptedBy: uid,
        dpaAcceptedByEmail: email,
        dpaVersion: '1.0',
        termsAcceptedAt: serverTimestamp(),
        termsVersion: '1.0'
      }
    });
    const orgId = orgRef.id;

    // 3. Create a user document in Firestore and link it to the organization.
    await setDoc(doc(db, 'users', uid), {
      name,
      email,
      orgId,
      role: 'admin', // First user is always an admin
      favorites: [],
      createdAt: serverTimestamp(),
      status: 'active'
    });

    // 4. Update the Firebase Auth profile display name
    await firebaseUpdateProfile(userCredential.user, { displayName: name });

    return { uid, orgId };
  },

  async inviteUser(email: string, role: string, name?: string, explicitOrgId?: string) {
    const user = auth.currentUser;
    if (!user) throw new Error('Du må være logget inn for å invitere brukere.');

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) throw new Error('Brukerprofil ikke funnet.');

    const userData = userDoc.data();
    let orgId = userData.orgId;
    if (userData.role === 'super_admin' && explicitOrgId) {
        orgId = explicitOrgId;
    }

    if (!orgId) throw new Error('Ingen organisasjon funnet for brukeren.');

    // Fetch organization name
    const orgDoc = await getDoc(doc(db, 'organizations', orgId));
    let orgName = 'Din organisasjon';
    if (orgDoc.exists()) {
        orgName = orgDoc.data().name;
    }

    // Create the invitation document
    const invitationRef = await addDoc(collection(db, 'invitations'), {
      email,
      role,
      name: name || null,
      orgId,
      orgName, // Store organization name in the invitation
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expires in 7 days
      createdAt: serverTimestamp(),
      createdBy: user.uid,
      status: 'pending'
    });

    // Generate the invitation link
    return `${window.location.origin}/invite?id=${invitationRef.id}`;
  },

  async signIn(email: string, password: string, rememberMe = false) {
    try {
      const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistence);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
        throw new Error(error.message);
    }
  },

  async signOut() {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
        throw new Error(error.message);
    }
  },

  async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  async sendPasswordResetEmail(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  async updateProfile(profile: { displayName?: string | null; photoURL?: string | null }) {
    if (!auth.currentUser) throw new Error('User not authenticated');
    try {
        await firebaseUpdateProfile(auth.currentUser, profile);
    } catch (error: any) {
        throw new Error(error.message);
    }
  },

  async deleteUser(uid: string) {
    try {
      // Pass both common parameter names to be robust against different cloud function versions
      await deleteUserCallable({ uid: uid, userId: uid });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
};