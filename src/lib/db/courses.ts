import { collection, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, getDocs, orderBy, serverTimestamp, limit, writeBatch } from 'firebase/firestore';
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

/**
 * Deletes a course and all associated assignments (Cascading Deletion)
 */
export const deleteCourse = async (courseId: string, orgId: string): Promise<void> => {
  const batch = writeBatch(db);
  
  // 1. Reference the course
  const courseRef = doc(db, 'courses', courseId);
  batch.delete(courseRef);

  // 2. Find all assignments for this course in this organization
  // We MUST include orgId in the query so Firestore rules can validate the request
  const assignmentsRef = collection(db, 'courseAssignments');
  const q = query(
    assignmentsRef, 
    where('orgId', '==', orgId),
    where('courseId', '==', courseId)
  );
  const assignmentSnap = await getDocs(q);
  
  // 3. Add assignment deletions to batch
  assignmentSnap.forEach((doc) => {
    batch.delete(doc.ref);
  });

  // 4. Commit atomic operation
  await batch.commit();
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
  if (status === 'completed') {
      updates.completedAt = serverTimestamp();
      
      // Handle Certification expiry if applicable
      const assignmentSnap = await getDoc(doc(db, 'courseAssignments', id));
      if (assignmentSnap.exists()) {
          const data = assignmentSnap.data();
          const courseSnap = await getDoc(doc(db, 'courses', data.courseId));
          if (courseSnap.exists()) {
              const course = courseSnap.data() as Course;
              if (course.isCertification && course.validityMonths) {
                  const expiryDate = new Date();
                  expiryDate.setMonth(expiryDate.getMonth() + course.validityMonths);
                  updates.expiresAt = expiryDate;
              }
          }
      }
  }
  
  await updateDoc(doc(db, 'courseAssignments', id), updates);
};
