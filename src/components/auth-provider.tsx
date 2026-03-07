'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
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

  useEffect(() => {
    async function fetchUserData() {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setDbUser(userDoc.data() as User);
          } else {
            setDbUser(null);
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          setDbUser(null);
        }
      } else {
        setDbUser(null);
      }
      setDataLoading(false);
    }

    if (!loading) {
      fetchUserData();
    }
  }, [user, loading]);

  const isLoading = loading || dataLoading;
  const isAdmin = dbUser?.role === 'admin';

  // Protect routes logic
  useEffect(() => {
    if (isLoading) return;

    const publicRoutes = ['/login', '/register', '/forgot-password', '/invite'];
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    if (!user && !isPublicRoute && pathname !== '/') {
      // Not logged in and trying to access protected route -> redirect to login
      router.push('/login');
    } else if (user && (pathname === '/login' || pathname === '/register' || pathname === '/forgot-password')) {
      // Logged in and trying to access auth route -> redirect to dashboard
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
