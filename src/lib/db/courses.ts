import { collection, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, getDocs, orderBy, serverTimestamp, limit } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Course, CourseAssignment } from '../types';

/**
 * COURSE CRUD
 */

export const createCourse = async (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'courses'), {
    ...course,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getCourse = async (id: string): Promise<Course | null> => {
  const docRef = doc(db, 'courses', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Course;
  }
  return null;
};

export const getCourses = async (orgId: string): Promise<Course[]> => {
  const q = query(
    collection(db, 'courses'), 
    where('orgId', '==', orgId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
};

export const updateCourse = async (id: string, updates: Partial<Course>): Promise<void> => {
  const docRef = doc(db, 'courses', id);
  await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
};

export const deleteCourse = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'courses', id));
};

/**
 * ASSIGNMENT CRUD
 */

export const assignCourseToUser = async (assignment: Omit<CourseAssignment, 'id' | 'assignedAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'courseAssignments'), {
    ...assignment,
    status: 'assigned',
    assignedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getUserAssignments = async (userId: string): Promise<CourseAssignment[]> => {
  const q = query(
    collection(db, 'courseAssignments'),
    where('userId', '==', userId),
    orderBy('assignedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CourseAssignment));
};

export const updateAssignmentStatus = async (id: string, status: CourseAssignment['status'], progress?: number): Promise<void> => {
  const updates: any = { status };
  if (progress !== undefined) updates.progress = progress;
  if (status === 'completed') updates.completedAt = serverTimestamp();
  
  await updateDoc(doc(db, 'courseAssignments', id), updates);
};
