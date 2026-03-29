'use client';

import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { FilePlus2, Search, X, RefreshCw, Route as RouteIcon, Activity } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useSearch } from '@/hooks/use-search';
import { usePathname, useRouter } from 'next/navigation';
import useUpdateNotifier from '@/hooks/useUpdateNotifier';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/firebase';
import { useEffect, useState } from 'react';
import { firebaseDB } from '@/lib/firebase/database';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { query, setQuery, contextName, contextLink } = useSearch();
  const pathname = usePathname();
  const router = useRouter();
  const { isUpdateAvailable, refreshPage } = useUpdateNotifier();
  
  const [user] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      firebaseDB.getUser(user.uid).then(u => {
        setIsAdmin(u?.role === 'admin');
      });
    }
  }, [user]);

  const isRoutesPage = pathname === '/dashboard/routes';
  const isMonitorPage = pathname === '/dashboard/monitor';

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Only redirect to dashboard if we are not already on the dashboard AND not on a page that handles its own search
    if (value && pathname !== '/dashboard' && !isRoutesPage && !isMonitorPage) {
        router.push('/dashboard');
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col relative">
          {isUpdateAvailable && (
            <div className="bg-primary text-primary-foreground text-center p-2 flex items-center justify-center">
              <p className="text-sm font-medium">En ny versjon er tilgjengelig.</p>
              <Button 
                variant="ghost"
                size="sm"
                className="ml-4 hover:bg-primary-foreground/10"
                onClick={refreshPage}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Last inn på nytt
              </Button>
            </div>
          )}
          <header className="sticky top-0 z-50 flex h-16 w-full items-center gap-4 border-b bg-background px-4 sm:px-6 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger className="md:hidden" />
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={`Søk etter ${contextName.toLowerCase()}...`}
                className="w-full rounded-full bg-secondary/50 pl-10 pr-10 border-none focus-visible:ring-primary h-10"
                value={query}
                onChange={handleSearchChange}
              />
              {query && (
                <button 
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
            
            {/* Only show the New button if user is an admin, OR if the context is 'Steder' (since drivers can add places) */}
            {(isAdmin || contextName === 'Steder') && (
                <div className="flex items-center gap-2">
                  <Button asChild size="sm" className="hidden sm:flex">
                    <Link href={contextLink}>
                      {contextName === 'Ruter' ? <RouteIcon className="mr-2 h-4 w-4" /> : <FilePlus2 className="mr-2 h-4 w-4" />}
                      {contextName === 'Ruter' ? 'Ny Rute' : 'Nytt Sted'}
                    </Link>
                  </Button>
                  <Button asChild size="icon" className="sm:hidden rounded-full h-10 w-10">
                    <Link href={contextLink}>
                      {contextName === 'Ruter' ? <RouteIcon className="h-5 w-5" /> : <FilePlus2 className="h-5 w-5" />}
                    </Link>
                  </Button>
                </div>
            )}
          </header>
          <main className="flex-1 bg-slate-50/50">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}