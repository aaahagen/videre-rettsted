
'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter, useParams } from 'next/navigation';
import { firebaseDB } from '../../../../lib/firebase/database';
import { auth } from '../../../../lib/firebase/firebase';

export default function RouteDetailsPage() {
  const [user, loading, error] = useAuthState(auth);
  const [route, setRoute] = useState<any>(null);
  const [name, setName] = useState('');
  const [distance, setDistance] = useState('');
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    if (user && id) {
      firebaseDB.getRoute(id as string).then(routeData => {
        if (routeData) {
          setRoute(routeData);
          setName(routeData.name);
          setDistance(routeData.distance.toString());
        }
      });
    }
  }, [user, id]);

  const handleUpdateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (route) {
      await firebaseDB.updateRoute(route.id, { name, distance: parseFloat(distance) });
      router.push('/dashboard/routes');
    }
  };

  const handleDeleteRoute = async () => {
    if (route && window.confirm('Are you sure you want to delete this route?')) {
      await firebaseDB.deleteRoute(route.id);
      router.push('/dashboard/routes');
    }
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

  if (!route) {
    return <p>Route not found.</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Route</h1>
      <form onSubmit={handleUpdateRoute} className="max-w-md mx-auto">
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="distance" className="block text-gray-700 font-semibold mb-2">Distance (in miles)</label>
          <input
            type="number"
            id="distance"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
            required
          />
        </div>
        <div className="flex justify-between">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Save Changes
          </button>
          <button type="button" onClick={handleDeleteRoute} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
            Delete Route
          </button>
        </div>
      </form>
    </div>
  );
}
