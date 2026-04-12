import { logEvent } from '../logs';
import { db } from '../../firebase/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

// Mock the firebase functions
jest.mock('../../firebase/firebase', () => ({
  db: {}
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  serverTimestamp: jest.fn()
}));

describe('logEvent', () => {
  it('should call addDoc with correct parameters', async () => {
    const orgId = 'test-org';
    const userId = 'test-user';
    const action = 'login';
    const details = { ip: '127.0.0.1' };

    await logEvent(orgId, userId, action, details);

    expect(collection).toHaveBeenCalledWith(db, 'audit_logs');
    expect(addDoc).toHaveBeenCalled();
  });
});
