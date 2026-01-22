
'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { firebaseDB } from '../../../lib/firebase/database';
import { auth } from '../../../lib/firebase/firebase';

export default function RoutesPage() {
  const [user, loading, error] = useAuthState(auth);
  const [routes, setRoutes] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      // In a real app, you would get the orgId from the user's claims
      // or from a document in Firestore. For now, we'll hardcode it.
      const orgId = 'mock-org-id'; 
      firebaseDB.getRoutes(orgId).then(setRoutes);
    }
  }, [user]);

  const handleCreateRoute = () => {
    router.push('/dashboard/routes/new');
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
        <h1 className="text-3xl font-bold">Routes</h1>
        <button onClick={handleCreateRoute} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Create Route
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {routes.map(route => (
          <div key={route.id} className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg" onClick={() => router.push(`/dashboard/routes/${route.id}`)}>
            <h2 className="text-xl font-semibold mb-2">{route.name}</h2>
            <p className="text-gray-600">{route.distance} miles</p>
          </div>
        ))}
      </div>
    </div>
  );
}
