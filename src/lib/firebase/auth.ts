
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, addDoc, collection } from 'firebase/firestore';
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
    console.log('Inviting user:', { email, role });
    // This is a complex operation that should be handled by a backend function.
    // 1. A backend function (e.g., Cloud Function) should create an invitation document in Firestore.
    // 2. The function should then generate a unique, secure link.
    // 3. The function should send an email (e.g., using SendGrid) with the link.
    // For now, we'll leave this as a placeholder.
    throw new Error('User invitation is not implemented yet.');
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
};
