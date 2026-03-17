'use client';

import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { FilePlus2, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useSearch } from '@/hooks/use-search';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { query, setQuery } = useSearch();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col relative">
          <header className="sticky top-0 z-50 flex h-16 w-full items-center gap-4 border-b bg-background px-4 sm:px-6 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger className="md:hidden" />
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Søk etter steder..."
                className="w-full rounded-full bg-secondary/50 pl-10 pr-10 border-none focus-visible:ring-primary h-10"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
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
            <div className="flex items-center gap-2">
              <Button asChild size="sm" className="hidden sm:flex">
                <Link href="/dashboard/new">
                  <FilePlus2 className="mr-2 h-4 w-4" />
                  Nytt Sted
                </Link>
              </Button>
              <Button asChild size="icon" className="sm:hidden rounded-full h-10 w-10">
                <Link href="/dashboard/new">
                  <FilePlus2 className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </header>
          <main className="flex-1 bg-slate-50/50">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
