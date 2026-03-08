'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore'; // Changed getDoc to onSnapshot
import { User } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: FirebaseUser | null | undefined;
  dbUser: User | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: undefined,
  dbUser: null,
  loading: true,
  isAdmin: false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, loading, error] = useAuthState(auth);
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Replaced one-time fetch with real-time listener to fix race condition during registration
  useEffect(() => {
    let unsubscribe: () => void;

    if (user) {
      const userRef = doc(db, 'users', user.uid);
      unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          setDbUser(docSnap.data() as User);
        } else {
          setDbUser(null);
        }
        setDataLoading(false); // Data is loaded (or confirmed missing)
      }, (err) => {
        console.error('Error listening to user data:', err);
        setDbUser(null);
        setDataLoading(false);
      });
    } else {
      setDbUser(null);
      setDataLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  const isLoading = loading || dataLoading;
  const isAdmin = dbUser?.role === 'admin';

  // Protect routes logic
  useEffect(() => {
    if (isLoading) return;

    const publicRoutes = ['/login', '/register', '/forgot-password', '/invite', '/about', '/']; 
    const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route) && route !== '/');

    if (!user && !isPublicRoute) {
      // User is on a protected route, not logged in -> redirect to login
      router.push('/login');
    } else if (user && (pathname === '/login' || pathname === '/register' || pathname === '/forgot-password')) {
      // User is logged in, trying to access auth routes -> redirect to dashboard
      router.push('/dashboard');
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, dbUser, loading: isLoading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
