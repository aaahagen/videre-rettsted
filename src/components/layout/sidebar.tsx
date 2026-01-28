'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  Heart,
  Home,
  LogOut,
  Settings,
  Shield,
  User as UserIcon,
  Building2,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Logo } from '../logo';
import { Skeleton } from '../ui/skeleton';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/firebase';
import { firebaseAuth } from '@/lib/firebase/auth';
import { firebaseDB } from '@/lib/firebase/database';
import { useEffect, useState } from 'react';
import { Organization } from '@/lib/types';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Hjem' },
  { href: '/dashboard/favorites', icon: Heart, label: 'Favoritter' },
  { href: '/dashboard/admin', icon: Shield, label: 'Admin' },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const [org, setOrg] = useState<Organization | null>(null);
  const [orgLoading, setOrgLoading] = useState(false);

  useEffect(() => {
    async function fetchOrg() {
      if (user) {
        setOrgLoading(true);
        try {
          const userData = await firebaseDB.getUser(user.uid);
          if (userData?.orgId) {
            const orgData = await firebaseDB.getOrganization(userData.orgId);
            setOrg(orgData);
          }
        } catch (error) {
          console.error("Error fetching organization:", error);
        } finally {
          setOrgLoading(false);
        }
      } else {
        setOrg(null);
      }
    }
    fetchOrg();
  }, [user]);

  const handleLogout = async () => {
    await firebaseAuth.signOut();
    router.push('/');
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'B';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  return (
    <Sidebar
      side="left"
      variant="sidebar"
      collapsible="icon"
      className="border-r"
    >
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <Logo className="h-8 w-8" />
          <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="font-headline text-lg font-semibold leading-none">
              Videre RettSted
            </span>
            {orgLoading ? (
               <Skeleton className="mt-1 h-3 w-20" />
            ) : org ? (
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Building2 className="h-3 w-3" />
                <span className="truncate font-medium">{org.name}</span>
              </div>
            ) : null}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => {
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label, className: 'bg-primary' }}
                >
                  <a href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        {loading ? (
          <div className="flex items-center gap-2 p-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex h-auto w-full items-center justify-start gap-2 p-2"
              >
                <Avatar className="h-10 w-10">
                  {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || user.email || ''} />}
                  <AvatarFallback>
                    {getInitials(user.displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left group-data-[collapsible=icon]:hidden md:block">
                  <p className="max-w-[150px] truncate font-semibold">{user.displayName || 'Bruker'}</p>
                  <p className="max-w-[150px] truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="w-56">
              <DropdownMenuLabel>Min Konto</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Innstillinger</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logg ut</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </SidebarFooter>
    </Sidebar>
  );
}
