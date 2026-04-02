import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';
import { Storage } from '../storage';

export class FirebaseStorage implements Storage {
  async uploadFile(path: string, file: File, metadata?: object): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file, metadata);
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }

  async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
       console.error("Error deleting file:", error);
       throw error;
    }
  }

  async getDownloadURL(path: string): Promise<string> {
     try {
      const storageRef = ref(storage, path);
      return await getDownloadURL(storageRef);
     } catch (error) {
       console.error("Error getting download URL:", error);
       throw error;
    }
  }
}

export const firebaseStorage = new FirebaseStorage();
