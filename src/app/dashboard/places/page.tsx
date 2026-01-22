
'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { firebaseDB } from '../../../lib/firebase/database';
import { auth } from '../../../lib/firebase/firebase';

export default function PlacesPage() {
  const [user, loading, error] = useAuthState(auth);
  const [places, setPlaces] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      // In a real app, you would get the orgId from the user's claims
      // or from a document in Firestore. For now, we'll hardcode it.
      const orgId = 'mock-org-id'; 
      firebaseDB.getPlaces(orgId).then(setPlaces);
    }
  }, [user]);

  const handleCreatePlace = () => {
    router.push('/dashboard/places/new');
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (!user) {
    router.push('/login');
    return null; 
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Places</h1>
        <button onClick={handleCreatePlace} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Create Place
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {places.map(place => (
          <div key={place.id} className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg" onClick={() => router.push(`/dashboard/places/${place.id}`)}>
            <h2 className="text-xl font-semibold mb-2">{place.name}</h2>
            <p className="text-gray-600">{place.address}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
