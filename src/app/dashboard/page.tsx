
'use client';

import { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { firebaseAuth } from '../../lib/firebase/auth';
import { auth } from '../../lib/firebase/firebase';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await firebaseAuth.signOut();
    router.push('/login');
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (!user) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Welcome to Your Dashboard</h1>
      <div className="flex flex-col items-center">
        <p className="text-lg mb-4">You are logged in as {user.email}</p>
        <button onClick={handleLogout} className="px-6 py-3 text-lg font-semibold text-white bg-red-600 rounded-md hover:bg-red-700">
          Logout
        </button>
      </div>
    </div>
  );
}
