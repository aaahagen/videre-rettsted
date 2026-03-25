
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp();

// Export all functions from their respective files
export * from './invitations';
export * from './organizations';
export * from './users';
export * from './routes';
