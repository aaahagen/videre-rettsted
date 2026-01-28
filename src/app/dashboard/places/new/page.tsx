
'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { firebaseDB } from '../../../lib/firebase/database';
import { auth } from '../../../lib/firebase/firebase';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';

export default function NewPlacePage() {
  const [user, loading, error] = useAuthState(auth);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleCreatePlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      // In a real app, you would get the orgId from the user's claims
      // or from a document in Firestore. For now, we'll hardcode it.
      const orgId = 'mock-org-id'; 
      await firebaseDB.createPlace({ name, address, orgId });
      router.push('/dashboard/places');
    }
  };

  const handleNameChange = (e: any) => {
    const value = e.target ? e.target.value : e;
    setName(value);
  };

  const handleAddressChange = (e: any) => {
    const value = e.target ? e.target.value : e;
    setAddress(value);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (!user) {
    return null; 
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Create New Place</h1>
      <form onSubmit={handleCreatePlace} className="max-w-md mx-auto">
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">Name</label>
          <Input
            id="name"
            value={name}
            onChange={handleNameChange}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="address" className="block text-gray-700 font-semibold mb-2">Address</label>
          <Input
            id="address"
            value={address}
            onChange={handleAddressChange}
            required
          />
        </div>
        <Button type="submit" className="w-full">
          Create Place
        </Button>
      </form>
    </div>
  );
}
