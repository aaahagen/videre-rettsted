
'use client';

import { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { firebaseAuth } from '../../lib/firebase/auth';
import { auth } from '../../lib/firebase/firebase';

export default function RegisterPage() {
  const [user, loading, error] = useAuthState(auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [registerError, setRegisterError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await firebaseAuth.registerOrganization(email, password, organizationName);
      router.push('/dashboard');
    } catch (err: any) {
      setRegisterError(err.message);
    }
  };

  if (loading) {
    return <p>Laster...</p>;
  }

  if (user) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Registrer</h1>
        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label htmlFor="organizationName" className="block text-gray-700 font-semibold mb-2">Organisasjonsnavn</label>
            <input
              type="text"
              id="organizationName"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">E-post</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">Passord</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mb-4">
            Registrer
          </button>
          {registerError && <p className="text-red-500 text-center mb-4">{registerError}</p>}
        </form>
      </div>
    </div>
  );
}
