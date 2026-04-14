'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { firebaseDB } from '@/lib/firebase/database';
import { auth } from '@/lib/firebase/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';

// Wrap the actual admin content in a separate component if it grows large
import AdminDashboardContent from './admin-content'; 

export default function AdminPage() {
  const [authUser, loadingAuth] = useAuthState(auth);
  const [isMounted, setIsMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    async function checkAdmin() {
      if (authUser) {
        const userDoc = await firebaseDB.getUser(authUser.uid);
        if (userDoc?.role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          router.push('/dashboard');
        }
      } else if (!loadingAuth) {
        router.push('/login');
      }
    }
    checkAdmin();
  }, [authUser, loadingAuth, router]);

  if (!isMounted || loadingAuth || isAdmin === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAdmin === false) {
      return null; // Will be redirected by useEffect
  }

  return <AdminDashboardContent />;
}