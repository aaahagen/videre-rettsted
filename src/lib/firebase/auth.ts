
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, sendPasswordResetEmail, updateProfile as firebaseUpdateProfile } from 'firebase/auth';
import { doc, setDoc, addDoc, collection, getDoc, serverTimestamp } from 'firebase/firestore';
import { Auth } from '../auth';
import { auth, db } from './firebase';

export const firebaseAuth: Auth = {
  async registerOrganization(email, password, organizationName) {
    // 1. Create user with email/password in Firebase Auth.
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // 2. Create an organization document in Firestore.
    const orgRef = await addDoc(collection(db, 'organizations'), {
      name: organizationName,
    });
    const orgId = orgRef.id;

    // 3. Create a user document in Firestore and link it to the organization.
    await setDoc(doc(db, 'users', uid), {
      email,
      orgId,
      role: 'admin', // First user is always an admin
    });

    return { uid, orgId };
  },

  async inviteUser(email, role) {
    const user = auth.currentUser;
    if (!user) throw new Error('Du må være logget inn for å invitere brukere.');

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) throw new Error('Brukerprofil ikke funnet.');

    const userData = userDoc.data();
    const orgId = userData.orgId;

    if (!orgId) throw new Error('Ingen organisasjon funnet for brukeren.');

    // Create the invitation document
    const invitationRef = await addDoc(collection(db, 'invitations'), {
      email,
      role,
      orgId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expires in 7 days
      createdAt: serverTimestamp(),
      createdBy: user.uid,
      status: 'pending'
    });

    // Generate the invitation link
    // Assuming the registration page handles the 'invite' query parameter
    return `${window.location.origin}/register?invite=${invitationRef.id}`;
  },

  async signIn(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { uid: userCredential.user.uid };
  },

  async signOut() {
    await firebaseSignOut(auth);
  },

  async sendPasswordResetEmail(email) {
    await sendPasswordResetEmail(auth, email);
  },

  getCurrentUser() {
    return auth.currentUser;
  },

  async updateProfile(profile) {
    if (auth.currentUser) {
      await firebaseUpdateProfile(auth.currentUser, profile);
    }
  },
};
