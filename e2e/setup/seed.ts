import * as admin from 'firebase-admin';

// Initialize the Firebase Admin SDK to connect to the Emulator
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';

// We use a dummy project ID that matches what the emulator expects
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'demo-app', 
  });
}

const db = admin.firestore();
const auth = admin.auth();

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // 1. Create a Test Organization
    const orgRef = db.collection('organizations').doc('test-org');
    await orgRef.set({
      name: 'Test Logistics Inc.',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('✅ Created Organization: test-org');

    // Attempt to create users, handling the case where they already exist in the emulator
    let adminUserRecord;
    try {
        adminUserRecord = await auth.createUser({
        uid: 'test-admin-uid',
        email: 'admin@test.com',
        password: 'password123',
        displayName: 'Test Admin',
      });
    } catch (e: any) {
        if (e.code === 'auth/uid-already-exists') {
             adminUserRecord = await auth.getUser('test-admin-uid');
             console.log('User already existed');
        } else {
            throw e;
        }
    }


    await db.collection('users').doc(adminUserRecord.uid).set({
      email: 'admin@test.com',
      name: 'Test Admin',
      orgId: 'test-org',
      role: 'admin',
      favorites: []
    });
    console.log('✅ Created/Updated Admin User: admin@test.com');

     // 3. Create a Test User (Driver)
     let driverUserRecord;
     try {
        driverUserRecord = await auth.createUser({
            uid: 'test-driver-uid',
            email: 'driver@test.com',
            password: 'password123',
            displayName: 'Test Driver',
        });
     } catch(e: any) {
        if (e.code === 'auth/uid-already-exists') {
             driverUserRecord = await auth.getUser('test-driver-uid');
             console.log('User already existed');
        } else {
            throw e;
        }
     }
  
      await db.collection('users').doc(driverUserRecord.uid).set({
        email: 'driver@test.com',
        name: 'Test Driver',
        orgId: 'test-org',
        role: 'driver',
        favorites: []
      });
      console.log('✅ Created/Updated Driver User: driver@test.com');


    // 4. Create Test Places
    const placesRef = db.collection('places');
    const place1Ref = placesRef.doc('test-place-1');
    await place1Ref.set({
      name: 'Central Warehouse',
      address: '123 Logistics Way',
      orgId: 'test-org',
      createdBy: adminUserRecord.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('✅ Created Place 1');

    const place2Ref = placesRef.doc('test-place-2');
    await place2Ref.set({
      name: 'Downtown Dropoff',
      address: '456 Main St',
      orgId: 'test-org',
      createdBy: adminUserRecord.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('✅ Created Place 2');

    // 5. Create a Test Route
    await db.collection('routes').doc('test-route-1').set({
      name: 'Morning Delivery Route',
      orgId: 'test-org',
      driverId: driverUserRecord.uid,
      status: 'active',
      date: new Date().toISOString().split('T')[0],
      items: [
        { id: 'item-1', placeId: 'test-place-1', type: 'place' },
        { id: 'item-2', placeId: 'test-place-2', type: 'place' }
      ],
      completedStopEvents: {},
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('✅ Created Route');

    console.log('🎉 Seeding complete!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

seed();
