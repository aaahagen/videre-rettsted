import { collection, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, getDocs, orderBy, serverTimestamp, limit, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Course, CourseAssignment } from '../types';

/**
 * Oppretter et nytt kurs i læringsportalen (LMS).
 * 
 * Kurs kan inneholde moduler, videoer og dokumenter, og kan markeres som 
 * obligatorisk sertifisering med utløpsdato.
 * 
 * @param course - Kursdata (uten ID).
 * @returns En Promise som løses med dokument-ID for det nye kurset.
 * 
 * @example
 * ```typescript
 * const courseId = await createCourse({
 *   title: "HMS på terminalen",
 *   orgId: "org_123",
 *   isCertification: true,
 *   validityMonths: 12
 * });
 * ```
 */
export const createCourse = async (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'courses'), {
    ...course,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

/**
 * Henter detaljer om et spesifikt kurs.
 * 
 * @param id - Identifikatoren til kurset.
 * @returns En Promise med `Course`-objektet eller `null`.
 */
export const getCourse = async (id: string): Promise<Course | null> => {
  const docRef = doc(db, 'courses', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Course;
  }
  return null;
};

/**
 * Henter alle kurs tilhørende en organisasjon.
 * 
 * @param orgId - Organisasjonens ID.
 * @returns En Promise med en liste over tilgjengelige kurs.
 */
export const getCourses = async (orgId: string): Promise<Course[]> => {
  const q = query(
    collection(db, 'courses'), 
    where('orgId', '==', orgId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
};

/**
 * Oppdaterer kursinnhold eller innstillinger.
 * 
 * @param id - Identifikatoren til kurset.
 * @param updates - Feltene som skal endres.
 */
export const updateCourse = async (id: string, updates: Partial<Course>): Promise<void> => {
  const docRef = doc(db, 'courses', id);
  await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
};

/**
 * Sletter et kurs og alle tilhørende kurstildelinger (kaskadesletting).
 * 
 * Denne funksjonen bruker en atomær `writeBatch` for å sikre at ingen 
 * foreldreløse tildelinger blir liggende igjen i databasen hvis kurset slettes.
 * 
 * @param courseId - ID-en til kurset som skal fjernes.
 * @param orgId - Organisasjonens ID (påkrevd for sikkerhetsverifisering).
 */
export const deleteCourse = async (courseId: string, orgId: string): Promise<void> => {
  const batch = writeBatch(db);
  
  const courseRef = doc(db, 'courses', courseId);
  batch.delete(courseRef);

  const assignmentsRef = collection(db, 'courseAssignments');
  const q = query(
    assignmentsRef, 
    where('orgId', '==', orgId),
    where('courseId', '==', courseId)
  );
  const assignmentSnap = await getDocs(q);
  
  assignmentSnap.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
};

/**
 * Tildeler et kurs til en spesifikk bruker.
 * 
 * @param assignment - Tildelingsdata (uten ID).
 * @returns En Promise med ID for tildelingen.
 * 
 * @example
 * ```typescript
 * await assignCourseToUser({
 *   userId: "user_abc",
 *   courseId: "course_123",
 *   orgId: "org_99"
 * });
 * ```
 */
export const assignCourseToUser = async (assignment: Omit<CourseAssignment, 'id' | 'assignedAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'courseAssignments'), {
    ...assignment,
    status: 'assigned',
    assignedAt: serverTimestamp(),
  });
  return docRef.id;
};

/**
 * Henter alle aktive og fullførte kurstildelinger for en bruker.
 * 
 * @param userId - Brukerens ID.
 * @returns En Promise med listen over tildelte kurs.
 */
export const getUserAssignments = async (userId: string): Promise<CourseAssignment[]> => {
  const q = query(
    collection(db, 'courseAssignments'),
    where('userId', '==', userId),
    orderBy('assignedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CourseAssignment));
};

/**
 * Henter alle kurstildelinger for en hel organisasjon (for lederoversikt).
 * 
 * @param orgId - Organisasjonens ID.
 * @returns En Promise med alle tildelinger i organisasjonen.
 */
export const getOrganizationAssignments = async (orgId: string): Promise<CourseAssignment[]> => {
  const q = query(
    collection(db, 'courseAssignments'),
    where('orgId', '==', orgId),
    orderBy('assignedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CourseAssignment));
};

/**
 * Oppdaterer status og fremdrift for en kurstildeling.
 * 
 * Hvis status settes til 'completed', vil funksjonen automatisk beregne 
 * utløpsdato dersom kurset er markert som en sertifisering.
 * 
 * @param id - Identifikatoren til tildelingen.
 * @param status - Den nye statusen (f.eks. 'in_progress', 'completed').
 * @param progress - Valgfri prosentvis fremdrift (0-100).
 */
export const updateAssignmentStatus = async (id: string, status: CourseAssignment['status'], progress?: number): Promise<void> => {
  const updates: any = { status };
  if (progress !== undefined) updates.progress = progress;
  if (status === 'completed') {
      updates.completedAt = serverTimestamp();
      
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
