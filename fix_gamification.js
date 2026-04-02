const fs = require('fs');
const fileTypes = 'src/lib/types.ts';
// Make sure User interface is correct
const fileDb = 'src/lib/firebase/database.ts';
let dbContent = fs.readFileSync(fileDb, 'utf8');

const targetToggleFavorite = `export const toggleFavorite = async (userId: string, placeId: string) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const userData = userSnap.data();
    const favorites = userData.favorites || [];
    if (favorites.includes(placeId)) {
      await updateDoc(userRef, { favorites: arrayRemove(placeId) });
    } else {
      await updateDoc(userRef, { favorites: arrayUnion(placeId) });
    }
  }
};`;

const newToggleFavorite = `export const toggleFavorite = async (userId: string, placeId: string) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const userData = userSnap.data();
    const favorites = userData.favorites || [];
    if (favorites.includes(placeId)) {
      await updateDoc(userRef, { favorites: arrayRemove(placeId) });
    } else {
      await updateDoc(userRef, { favorites: arrayUnion(placeId) });
    }
  }
};

export const markPlaceVisited = async (userId: string, placeId: string) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { visitedPlaces: arrayUnion(placeId) });
};`;

dbContent = dbContent.replace(targetToggleFavorite, newToggleFavorite);

const targetExport = `export const firebaseDB: Database = {
  createOrganization,`;

const newExport = `export const firebaseDB = {
  createOrganization,`;

// We don't need to change the interface of Database right now, or we can just export it. Wait, if it implements Database interface, we need to update src/lib/database.ts too. Let's just not enforce the interface if we export the specific function or just update the interface.

fs.writeFileSync(fileDb, dbContent);
