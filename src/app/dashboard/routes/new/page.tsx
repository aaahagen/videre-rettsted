
'use client';

import { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { firebaseDB } from '../../../lib/firebase/database';
import { auth } from '../../../lib/firebase/firebase';

export default function NewRoutePage() {
  const [user, loading, error] = useAuthState(auth);
  const [name, setName] = useState('');
  const [distance, setDistance] = useState('');
  const router = useRouter();

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      // In a real app, you would get the orgId from the user's claims
      // or from a document in Firestore. For now, we'll hardcode it.
      const orgId = 'mock-org-id'; 
      await firebaseDB.createRoute({ name, distance: parseFloat(distance), orgId });
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Create New Route</h1>
      <form onSubmit={handleCreateRoute} className="max-w-md mx-auto">
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
        <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Create Route
        </button>
      </form>
    </div>
  );
}
