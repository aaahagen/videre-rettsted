'use client';

import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { FilePlus2, Search, X, RefreshCw, Route as RouteIcon, Activity, UserPlus, Truck, Package } from 'lucide-react';
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
        setIsAdmin(u?.role === 'admin' || u?.role === 'owner');
      });
    }
  }, [user]);

  const isRoutesPage = pathname === '/dashboard/routes';
  const isMonitorPage = pathname === '/dashboard/monitor';
  const isPlacesPage = pathname === '/dashboard/places';
  const isOrdersPage = pathname === '/dashboard/orders';

  // Check if we are on a manifests page (e.g., /dashboard/manifests or /dashboard/manifests/[id])
  const isManifestsPage = pathname.startsWith('/dashboard/manifests');
  
  // Check if we are on the messages page
  const isMessagesPage = pathname === '/dashboard/messages';

  // Define paths where search bar should NOT be shown
  const hideSearchPaths = ['/dashboard', '/dashboard/admin', '/dashboard/new', '/dashboard/super'];
  const showSearch = !hideSearchPaths.includes(pathname);


  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Only redirect to places if we are not already on a page that handles its own search
    if (value && pathname !== '/dashboard/places' && !isRoutesPage && !isMonitorPage && !isOrdersPage && pathname !== '/dashboard/workforce' && pathname !== '/dashboard/fleet' && !isManifestsPage && !isMessagesPage) {
        router.push('/dashboard/places');
    }
  };

  const searchPlaceholder = isManifestsPage ? "Søk etter ruter eller biler..." : isMessagesPage ? "Søk i meldinger..." : `Søk etter ${contextName.toLowerCase()}...`;
  const showNewButton = !isManifestsPage && !isMessagesPage && ((isAdmin || contextName === 'Steder') && showSearch);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col relative min-w-0">
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
              {showSearch && (
                <>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={searchPlaceholder}
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
                </>
              )}
            </div>
            
            {/* Only show the New button if user is an admin, OR if the context is 'Steder' (since drivers can add places) */}
            {showNewButton && (
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    className="hidden sm:flex"
                    onClick={() => {
                        if (contextName === 'Kjøretøy') {
                            window.dispatchEvent(new CustomEvent('open-new-vehicle-form'));
                        } else {
                            router.push(contextLink);
                        }
                    }}
                  >
                    {contextName === 'Ruter' ? <RouteIcon className="mr-2 h-4 w-4" /> : contextName === 'Personell' ? <UserPlus className="mr-2 h-4 w-4" /> : contextName === 'Kjøretøy' ? <Truck className="mr-2 h-4 w-4" /> : contextName === 'Ordrer' ? <Package className="mr-2 h-4 w-4" /> : <FilePlus2 className="mr-2 h-4 w-4" />}
                    {contextName === 'Ruter' ? 'Ny Rute' : contextName === 'Personell' ? 'Nytt personell' : contextName === 'Kjøretøy' ? 'Nytt Kjøretøy' : contextName === 'Ordrer' ? 'Ny Ordre' : 'Nytt Sted'}
                  </Button>
                  <Button 
                    size="icon" 
                    className="sm:hidden rounded-full h-10 w-10"
                    onClick={() => {
                        if (contextName === 'Kjøretøy') {
                            window.dispatchEvent(new CustomEvent('open-new-vehicle-form'));
                        } else {
                            router.push(contextLink);
                        }
                    }}
                  >
                    {contextName === 'Ruter' ? <RouteIcon className="h-5 w-5" /> : contextName === 'Personell' ? <UserPlus className="h-5 w-5" /> : contextName === 'Kjøretøy' ? <Truck className="h-5 w-5" /> : contextName === 'Ordrer' ? <Package className="h-5 w-5" /> : <FilePlus2 className="h-5 w-5" />}
                  </Button>
                </div>
            )}
          </header>
          <main className="flex-1 bg-slate-50/50 min-w-0 flex flex-col">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}