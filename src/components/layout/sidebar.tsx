'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  Clock, Star,
  Truck,
  Users,
  Route,
  Home,
  LogOut,
  Settings,
  Shield,
  User as UserIcon,
  Building2,
  ChevronsUpDown,
  PlusCircle,
  Lock,
  Info,
  Scale,
  ChevronDown,
  MessageSquare
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
  SidebarGroup,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Logo } from '../logo';
import { Skeleton } from '../ui/skeleton';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase/firebase'; // Added db import
import { firebaseAuth } from '@/lib/firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore'; // Added onSnapshot
import { useEffect, useState } from 'react';
import { Organization, User } from '@/lib/types';
import { collection, query, where, onSnapshot as onSnapshotFirestore } from 'firebase/firestore';
import Link from 'next/link';
import { useAuth } from '../auth-provider';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Leveringssteder' },
  { href: '/dashboard/new', icon: PlusCircle, label: 'Nytt sted' },
  { href: '/dashboard/favorites', icon: Star, label: 'Favoritter' },
  { href: '/dashboard/routes', icon: Route, label: 'Ruter' },
  { href: '/dashboard/messages', icon: MessageSquare, label: 'Meldinger' },
  { href: '/dashboard/fleet', icon: Truck, label: 'Kjøretøy', adminOnly: true },
  { href: '/dashboard/workforce', icon: Users, label: 'Personell', adminOnly: true },
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
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Changed to real-time listener to handle permission propagation delays
  useEffect(() => {
    let unsubscribeOrg: () => void;
    let unsubscribeMessages: () => void;

    if (dbUser?.orgId) {
      setOrgLoading(true);
      const orgRef = doc(db, 'organizations', dbUser.orgId);
      
      unsubscribeOrg = onSnapshot(orgRef, (docSnap) => {
        if (docSnap.exists()) {
          setOrg({ ...docSnap.data(), id: docSnap.id } as Organization);
        } else {
          setOrg(null);
        }
        setOrgLoading(false);
      }, (error) => {
        console.error("Error listening to org data:", error);
        setOrgLoading(false);
      });

      // Listen for unread messages
      const messagesRef = collection(db, 'messages');
      const q = query(
          messagesRef,
          where('orgId', '==', dbUser.orgId)
      );

      unsubscribeMessages = onSnapshotFirestore(q, (snapshot) => {
          let count = 0;
          snapshot.forEach(doc => {
              const msg = doc.data();
              
              // Only count if it's meant for me
              let isForMe = false;
              if (dbUser.role === 'admin') {
                  isForMe = true; // Admins see everything
              } else {
                  isForMe = msg.recipientId === 'all' || msg.recipientId === 'all_drivers' || msg.recipientId === dbUser.id;
              }

              // AND I haven't read it AND I didn't send it
              if (isForMe && msg.senderId !== dbUser.id && !(msg.readBy || []).includes(dbUser.id)) {
                  count++;
              }
          });
          setUnreadMessages(count);
      });

    } else {
      setOrg(null);
      setOrgLoading(false);
      setUnreadMessages(0);
    }

    return () => {
      if (unsubscribeOrg) unsubscribeOrg();
      if (unsubscribeMessages) unsubscribeMessages();
    };
  }, [dbUser]);



  const handleLogout = async () => {
    await firebaseAuth.signOut();
    router.push('/');
  };

  const displayName = dbUser?.name || authUser?.displayName || authUser?.email || 'Bruker';
  const isAdmin = dbUser?.role === 'admin';

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
              VIDERE
            </span>
            <span className="font-headline text-lg font-bold leading-[1.1] tracking-tight text-sidebar-foreground">
              RettSted
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2 flex flex-col h-full overflow-hidden">
        <SidebarMenu className="mb-4 shrink-0">
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
                      <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                        <span className="truncate font-semibold">{displayName}</span>
                        <span className="truncate text-xs text-muted-foreground">Profilinnstillinger</span>
                      </div>
                      <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side={isMobile ? "bottom" : "right"}
                    align="end"
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  >
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

        <ScrollArea className="flex-1 -mx-2 px-2">
            <SidebarGroup>
            <SidebarMenu>
            {navItems.map((item) => {
                if (item.adminOnly && !isAdmin) return null;

                return (
                <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={{ children: item.label, className: 'bg-primary' }}
                    onClick={() => setOpenMobile(false)}
                    >
                    <Link href={item.href} className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-2">
                           <item.icon />
                           <span>{item.label}</span>
                        </div>
                        {item.href === '/dashboard/messages' && unreadMessages > 0 && (
                            <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-4 text-center">
                                {unreadMessages}
                            </span>
                        )}
                    </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                );
            })}
            {isAdmin && (
                <Collapsible
                open={isLegalOpen}
                onOpenChange={setIsLegalOpen}
                className="group/collapsible"
                >
                <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={{ children: 'Juridisk', className: 'bg-primary' }}>
                        <Scale className="h-4 w-4" />
                        <span>Juridisk</span>
                        <ChevronDown className={`ml-auto h-4 w-4 transition-transform duration-200 ${isLegalOpen ? 'rotate-180' : ''}`} />
                    </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 px-4 py-2">
                    <SidebarMenuButton asChild className="h-8 text-sm">
                        <Link href="/legal/personvern" onClick={() => setOpenMobile(false)}>
                        Personvern
                        </Link>
                    </SidebarMenuButton>
                    <SidebarMenuButton asChild className="h-8 text-sm">
                        <Link href="/legal/vilkar" onClick={() => setOpenMobile(false)}>
                        Brukervilkår
                        </Link>
                    </SidebarMenuButton>
                    <SidebarMenuButton asChild className="h-8 text-sm">
                        <Link href="/legal/dpa" onClick={() => setOpenMobile(false)}>
                        DPA
                        </Link>
                    </SidebarMenuButton>
                    </CollapsibleContent>
                </SidebarMenuItem>
                </Collapsible>
            )}
            </SidebarMenu>
            </SidebarGroup>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
}
