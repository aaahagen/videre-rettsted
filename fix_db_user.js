const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/firebase/database.ts');
let content = fs.readFileSync(filePath, 'utf8');

const badCreate = `const createPlace = async (place: Omit<Place, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<Place> => {
  const docRef = await addDoc(collection(db, 'places'), {
    ...place,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Log event
  const orgId = place.orgId || place.organizationId;
  const authorId = user.uid;`;

const newCreate = `const createPlace = async (place: Omit<Place, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<Place> => {
  const user = auth.currentUser;
  if (!user) throw new Error("User must be logged in to create a place");

  const docRef = await addDoc(collection(db, 'places'), {
    ...place,
    createdBy: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Log event
  const orgId = place.orgId || place.organizationId;
  const authorId = user.uid;`;

content = content.replace(badCreate, newCreate);
fs.writeFileSync(filePath, content);
console.log('Fixed createPlace to include user context');
