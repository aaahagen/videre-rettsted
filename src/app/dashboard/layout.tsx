import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { FilePlus2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:h-16 sm:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Søk etter steder..."
                className="w-full rounded-lg bg-secondary pl-8 md:w-[200px] lg:w-[320px]"
              />
            </div>
            <Button asChild>
              <Link href="/dashboard/new">
                <FilePlus2 className="mr-2 h-4 w-4" />
                Nytt Sted
              </Link>
            </Button>
          </header>
          <main className="flex-1 overflow-y-auto bg-secondary/50">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
