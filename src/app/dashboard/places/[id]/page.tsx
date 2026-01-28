
'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter, useParams } from 'next/navigation';
import { firebaseDB } from '../../../../lib/firebase/database';
import { auth } from '../../../../lib/firebase/firebase';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';

export default function PlaceDetailsPage() {
  const [user, loading, error] = useAuthState(auth);
  const [place, setPlace] = useState<any>(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && id) {
      firebaseDB.getPlace(id as string).then(placeData => {
        if (placeData) {
          setPlace(placeData);
          setName(placeData.name);
          setAddress(placeData.address);
        }
      });
    }
  }, [user, id]);

  const handleUpdatePlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (place) {
      await firebaseDB.updatePlace(place.id, { name, address });
      router.push('/dashboard/places');
    }
  };

  const handleDeletePlace = async () => {
    if (place && window.confirm('Are you sure you want to delete this place?')) {
      await firebaseDB.deletePlace(place.id);
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

  if (!place) {
    return <p>Place not found.</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Place</h1>
      <form onSubmit={handleUpdatePlace} className="max-w-md mx-auto">
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
        <div className="flex justify-between">
          <Button type="submit">
            Save Changes
          </Button>
          <Button type="button" variant="destructive" onClick={handleDeletePlace}>
            Delete Place
          </Button>
        </div>
      </form>
    </div>
  );
}
