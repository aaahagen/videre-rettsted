const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/firebase/database.ts');
let content = fs.readFileSync(filePath, 'utf8');

const badUpdate = `const updatePlace = async (id: string, updates: Partial<Place>): Promise<Place> => {
  const docRef = doc(db, 'places', id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });`;

const newUpdate = `const updatePlace = async (id: string, updates: Partial<Place>): Promise<Place> => {
  const user = auth.currentUser;
  if (!user) throw new Error("User must be logged in to update a place");
  const docRef = doc(db, 'places', id);
  await updateDoc(docRef, {
    ...updates,
    updatedBy: user.uid,
    updatedAt: serverTimestamp(),
  });`;

content = content.replace(badUpdate, newUpdate);
fs.writeFileSync(filePath, content);
console.log('Fixed updatePlace to include updatedBy');
