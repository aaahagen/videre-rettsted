import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, serverTimestamp, Timestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Vehicle, VehicleDamageReport } from '../types';
import { cleanObject } from '../utils';

export async function getVehicles(orgId: string): Promise<Vehicle[]> {
  try {
    const q = query(collection(db, 'vehicles'), where('orgId', '==', orgId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
      updatedAt: (doc.data().updatedAt as Timestamp)?.toDate() || new Date(),
    })) as Vehicle[];
  } catch (error) {
    console.error("Error getting vehicles:", error);
    throw error;
  }
}

export async function getVehicle(id: string): Promise<Vehicle | null> {
  try {
    const docRef = doc(db, 'vehicles', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: (docSnap.data().createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (docSnap.data().updatedAt as Timestamp)?.toDate() || new Date(),
      } as Vehicle;
    }
    return null;
  } catch (error) {
    console.error("Error getting vehicle:", error);
    throw error;
  }
}

export async function createVehicle(data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle> {
  try {
    // Clean data: remove system fields if present and convert undefined values
    const { id, createdAt, updatedAt, ...rest } = data as any;
    const finalData = cleanObject(rest);

    const docRef = await addDoc(collection(db, 'vehicles'), {
      ...finalData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      currentStatuses: finalData.currentStatuses || ['ready'],
    });
    return { id: docRef.id, ...data, createdAt: new Date(), updatedAt: new Date() } as Vehicle;
  } catch (error) {
    console.error("Error creating vehicle:", error);
    throw error;
  }
}

export async function updateVehicle(id: string, data: Partial<Vehicle>): Promise<void> {
  try {
    const docRef = doc(db, 'vehicles', id);
    
    // Remove ID and timestamps from the update payload
    const { id: _, createdAt, updatedAt, ...rest } = data as any;
    const finalData = cleanObject(rest);

    await updateDoc(docRef, {
      ...finalData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating vehicle:", error);
    throw error;
  }
}

export async function deleteVehicle(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'vehicles', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    throw error;
  }
}

export async function addVehicleStatus(id: string, status: string): Promise<void> {
    try {
        const docRef = doc(db, 'vehicles', id);
        if (status !== 'ready') {
             await updateDoc(docRef, {
                currentStatuses: arrayRemove('ready')
            });
        }
        await updateDoc(docRef, {
            currentStatuses: arrayUnion(status),
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error adding vehicle status:", error);
        throw error;
    }
}

export async function removeVehicleStatus(id: string, status: string): Promise<void> {
    try {
        const docRef = doc(db, 'vehicles', id);
        await updateDoc(docRef, {
            currentStatuses: arrayRemove(status),
            updatedAt: serverTimestamp(),
        });
        
        const updatedDoc = await getDoc(docRef);
        if (updatedDoc.exists() && (!updatedDoc.data().currentStatuses || updatedDoc.data().currentStatuses.length === 0)) {
            await updateDoc(docRef, {
                 currentStatuses: ['ready'],
                 updatedAt: serverTimestamp(),
            })
        }
        
    } catch (error) {
        console.error("Error removing vehicle status:", error);
        throw error;
    }
}

export async function getVehicleDamages(vehicleId: string): Promise<VehicleDamageReport[]> {
  try {
    const q = query(
      collection(db, 'vehicleDamages'),
      where('vehicleId', '==', vehicleId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
      resolvedAt: doc.data().resolvedAt ? (doc.data().resolvedAt as Timestamp).toDate() : undefined,
    })).sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime()) as VehicleDamageReport[];
  } catch (error) {
    console.error("Error getting vehicle damages:", error);
    throw error;
  }
}

export async function reportVehicleDamage(data: Omit<VehicleDamageReport, 'id' | 'createdAt'>): Promise<VehicleDamageReport> {
  try {
    const docRef = await addDoc(collection(db, 'vehicleDamages'), {
      ...data,
      createdAt: serverTimestamp(),
      status: 'reported'
    });
    
    const vehicleRef = doc(db, 'vehicles', data.vehicleId);
    await updateDoc(vehicleRef, {
        currentStatuses: arrayUnion('observation')
    });

    return { id: docRef.id, ...data, createdAt: new Date() } as VehicleDamageReport;
  } catch (error) {
    console.error("Error reporting vehicle damage:", error);
    throw error;
  }
}

export async function updateDamageStatus(damageId: string, status: 'reported' | 'in_progress' | 'fixed', resolvedBy?: string): Promise<void> {
  try {
    const docRef = doc(db, 'vehicleDamages', damageId);
    const updateData: any = { status };
    if (status === 'fixed') {
        updateData.resolvedAt = serverTimestamp();
        updateData.resolvedBy = resolvedBy;
    }
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error("Error updating damage status:", error);
    throw error;
  }
}

export async function getVehicleUsageLog(vehicleId: string, days: number = 7): Promise<any[]> {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const q = query(
            collection(db, 'routes'),
            where('vehicleId', '==', vehicleId),
            where('date', '>=', startDate.toISOString().split('T')[0])
        );
        const querySnapshot = await getDocs(q);
        
        const usage = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                routeId: doc.id,
                date: data.date,
                driverId: data.driverId,
                status: data.status,
            };
        });

        return usage.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
        console.error("Error getting vehicle usage:", error);
        return [];
    }
}
