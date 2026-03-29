'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, PlusCircle, Route, Shield, Info, LogOut, Star } from 'lucide-react';

import { useAuth } from '@/components/auth-provider';
import { Organization } from '@/lib/types';
import { firebaseDB } from '@/lib/firebase/database';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import Logo from '@/components/logo';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Leveringssteder' },
  { href: '/dashboard/new', icon: PlusCircle, label: 'Nytt sted' },
  { href: '/dashboard/favorites', icon: Star, label: 'Favoritter' },
  { href: '/dashboard/routes', icon: Route, label: 'Ruter' },
  { href: '/dashboard/monitor', icon: Clock, label: 'Overvåkning', adminOnly: true },
  { href: '/dashboard/admin', icon: Shield, label: 'Admin', adminOnly: true },
  { href: '/about', icon: Info, label: 'Om Siden', adminOnly: true },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user: authUser, loading, dbUser } = useAuth();
  const [org, setOrg] = useState<Organization | null>(null);
  const [orgLoading, setOrgLoading] = useState(false);
  const { setOpenMobile, isMobile } = useSidebar();
  const [isLegalOpen, setIsLegalOpen] = useState(false);

  useEffect(() => {
    if (dbUser?.orgId && !org) {
      setOrgLoading(true);
      firebaseDB.getOrganization(dbUser.orgId).then(orgData => {
        setOrg(orgData);
        setOrgLoading(false);
      });
    }
  }, [dbUser, org]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleLegalClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsLegalOpen(!isLegalOpen);
  };

  return (
    <div className="flex h-full max-h-screen flex-col gap-2">
      <div className="flex h-16 items-center border-b px-4 lg:h-16 lg:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Logo />
        </Link>
      </div>
      <div className="flex-1">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {navItems.map(item => {
            if (item.adminOnly && dbUser?.role !== 'admin') {
              return null;
            }
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                  pathname === item.href
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-primary'
                }`}
                onClick={() => isMobile && setOpenMobile(false)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start">
              <LogOut className="mr-2 h-4 w-4" />
              <span>{dbUser?.name || 'Menu'}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleLogout}>Logg ut</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}