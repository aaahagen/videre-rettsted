'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  Star,
  Home,
  LogOut,
  Settings,
  Shield,
  User as UserIcon,
  Building2,
  ChevronsUpDown,
  PlusCircle,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
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
import { Logo } from '../logo';
import { Skeleton } from '../ui/skeleton';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/firebase';
import { firebaseAuth } from '@/lib/firebase/auth';
import { firebaseDB } from '@/lib/firebase/database';
import { useEffect, useState } from 'react';
import { Organization, User } from '@/lib/types';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Leveringssteder' },
  { href: '/dashboard/new', icon: PlusCircle, label: 'Nytt sted' },
  { href: '/dashboard/favorites', icon: Star, label: 'Favoritter' },
  { href: '/dashboard/admin', icon: Shield, label: 'Admin' },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [authUser, loading] = useAuthState(auth);
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [org, setOrg] = useState<Organization | null>(null);
  const [orgLoading, setOrgLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (authUser) {
        setOrgLoading(true);
        try {
          const userData = await firebaseDB.getUser(authUser.uid);
          setDbUser(userData);
          if (userData?.orgId) {
            const orgData = await firebaseDB.getOrganization(userData.orgId);
            setOrg(orgData);
          }
        } catch (error) {
          console.error("Error fetching user/org data:", error);
        } finally {
          setOrgLoading(false);
        }
      } else {
        setDbUser(null);
        setOrg(null);
      }
    }
    fetchData();
  }, [authUser]);

  const handleLogout = async () => {
    await firebaseAuth.signOut();
    router.push('/');
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'B';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const displayName = dbUser?.name || authUser?.displayName || authUser?.email || 'Bruker';

  return (
    <Sidebar
      side="left"
      variant="sidebar"
      collapsible="icon"
      className="border-r"
    >
      <SidebarHeader>
        <div className="flex items-center gap-3 px-3 py-2">
          <Logo className="h-10 w-10 shrink-0 rounded-lg" />
          <div className="flex flex-col justify-center overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="font-headline text-lg font-bold leading-[1.1] tracking-tight text-sidebar-foreground">
              Videre
            </span>
            <span className="font-headline text-lg font-bold leading-[1.1] tracking-tight text-sidebar-foreground">
              RettSted
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu className="mb-4">
            <SidebarMenuItem>
                {loading ? (
                    <div className="flex items-center gap-2 p-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex flex-col gap-1 group-data-[collapsible=icon]:hidden">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-2 w-24" />
                        </div>
                    </div>
                ) : authUser ? (
                    <div className="space-y-1">
                        {orgLoading ? (
                            <Skeleton className="ml-2 h-3 w-24" />
                        ) : org ? (
                            <div className="ml-2 flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground font-bold group-data-[collapsible=icon]:hidden">
                                <Building2 className="h-3 w-3" />
                                <span className="truncate">{org.name}</span>
                            </div>
                        ) : null}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton 
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        {(authUser.photoURL || dbUser?.avatarUrl) && (
                                            <AvatarImage 
                                                src={authUser.photoURL || dbUser?.avatarUrl} 
                                                alt={displayName} 
                                            />
                                        )}
                                        <AvatarFallback className="rounded-lg">
                                            {getInitials(displayName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                        <span className="truncate font-semibold">{displayName}</span>
                                        <span className="truncate text-xs text-muted-foreground">{authUser.email}</span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent 
                                side="right" 
                                align="end" 
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                            >
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                        <Avatar className="h-8 w-8 rounded-lg">
                                            {(authUser.photoURL || dbUser?.avatarUrl) && (
                                                <AvatarImage 
                                                    src={authUser.photoURL || dbUser?.avatarUrl} 
                                                    alt={displayName} 
                                                />
                                            )}
                                            <AvatarFallback className="rounded-lg">
                                                {getInitials(displayName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-semibold">{displayName}</span>
                                            <span className="truncate text-xs">{authUser.email}</span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
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
                    </div>
                ) : null}
            </SidebarMenuItem>
        </SidebarMenu>

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
    </Sidebar>
  );
}
