import { incrementManifestItemLoadedCount, decrementManifestItemLoadedCount } from '../manifests';
import { db } from '../../firebase/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { updateOrder } from '../orders';

// Mock Firestore functions
jest.mock('../../firebase/firebase', () => ({
  db: {}
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  serverTimestamp: jest.fn(() => 'mock-timestamp')
}));

jest.mock('../orders', () => ({
  updateOrder: jest.fn()
}));

describe('Manifest Functions', () => {
  const orgId = 'org-1';
  const manifestId = 'manifest-1';
  const orderId = 'order-1';
  const userId = 'user-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('incrementManifestItemLoadedCount', () => {
    it('should increment loadedItems when not fully loaded', async () => {
      const mockManifest = {
        orders: [
          { orderId: 'order-1', totalItems: 3, loadedItems: 1, status: 'pending' }
        ]
      };

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => mockManifest
      });

      await incrementManifestItemLoadedCount(orgId, manifestId, orderId, userId);

      expect(updateDoc).toHaveBeenCalledWith(undefined, {
        orders: [
          { orderId: 'order-1', totalItems: 3, loadedItems: 2, status: 'pending' }
        ],
        updatedAt: 'mock-timestamp'
      });
      expect(updateOrder).not.toHaveBeenCalled();
    });

    it('should update status to loaded when all items are loaded', async () => {
      const mockManifest = {
        orders: [
          { orderId: 'order-1', totalItems: 2, loadedItems: 1, status: 'pending' }
        ]
      };

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => mockManifest
      });

      await incrementManifestItemLoadedCount(orgId, manifestId, orderId, userId);

      expect(updateDoc).toHaveBeenCalledWith(undefined, {
        orders: [
          { 
            orderId: 'order-1', 
            totalItems: 2, 
            loadedItems: 2, 
            status: 'loaded',
            loadedAt: 'mock-timestamp',
            loadedBy: userId
          }
        ],
        updatedAt: 'mock-timestamp'
      });
      expect(updateOrder).toHaveBeenCalledWith(orgId, orderId, { status: 'loaded' });
    });

    it('should throw error if already fully loaded', async () => {
      const mockManifest = {
        orders: [
          { orderId: 'order-1', totalItems: 2, loadedItems: 2, status: 'loaded' }
        ]
      };

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => mockManifest
      });

      await expect(incrementManifestItemLoadedCount(orgId, manifestId, orderId, userId))
        .rejects.toThrow(`All items for order ${orderId} have already been loaded.`);
    });
  });

  describe('decrementManifestItemLoadedCount', () => {
    it('should decrement loadedItems and revert status if it was fully loaded', async () => {
      const mockManifest = {
        orders: [
          { orderId: 'order-1', totalItems: 2, loadedItems: 2, status: 'loaded', loadedAt: 'mock-timestamp', loadedBy: userId }
        ]
      };

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => mockManifest
      });

      await decrementManifestItemLoadedCount(orgId, manifestId, orderId);

      expect(updateDoc).toHaveBeenCalledWith(undefined, {
        orders: [
          { orderId: 'order-1', totalItems: 2, loadedItems: 1, status: 'pending', loadedAt: undefined, loadedBy: undefined }
        ],
        updatedAt: 'mock-timestamp'
      });
      expect(updateOrder).toHaveBeenCalledWith(orgId, orderId, { status: 'pending' });
    });

    it('should throw error if loadedItems is already 0', async () => {
      const mockManifest = {
        orders: [
          { orderId: 'order-1', totalItems: 2, loadedItems: 0, status: 'pending' }
        ]
      };

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => mockManifest
      });

      await expect(decrementManifestItemLoadedCount(orgId, manifestId, orderId))
        .rejects.toThrow(`No items for order ${orderId} to unload.`);
    });
  });
});
