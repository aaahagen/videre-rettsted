"use client";
import { usePathname, useRouter } from "next/navigation";

import {
  Activity,
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
  Scale, MapPin,
  ChevronDown,
  MessageSquare,
  Package,
  GraduationCap,
  Sparkles
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
  SidebarGroupLabel,
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
import { Trophy } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { firebaseDB } from '@/lib/firebase/database';
import Link from 'next/link';
import { useAuth } from '../auth-provider';

const navGroups = [
  {
    label: 'Daglig Drift',
    items: [
      { href: '/dashboard', icon: Home, label: 'Oversikt' },
      { href: '/dashboard/monitor', icon: Activity, label: 'Overvåkning', adminOnly: true },
      { href: '/dashboard/messages', icon: MessageSquare, label: 'Meldinger' },
      { href: '/dashboard/learning', icon: GraduationCap, label: 'Læringsportal' },
    ]
  },
  {
    label: 'Logistikk',
    items: [
      { href: '/dashboard/routes', icon: Route, label: 'Ruter' },
      { href: '/dashboard/admin/routing-engine', icon: Sparkles, label: 'Auto-planlegging', adminOnly: true },
      { href: '/dashboard/orders', icon: Package, label: 'Ordrer', adminOnly: true },
      { href: '/dashboard/manifests', icon: Package, label: 'Lasterampe', roles: ['admin', 'loader'] },
      { href: '/dashboard/places', icon: MapPin, label: 'Leveringssteder' },
      { href: '/dashboard/favorites', icon: Star, label: 'Favoritter' },
      { href: '/dashboard/new', icon: PlusCircle, label: 'Nytt sted' },
    ]
  },
  {
    label: 'Ressurser',
    adminOnly: true,
    items: [
      { href: '/dashboard/workforce', icon: Users, label: 'Personell', adminOnly: true },
      { href: '/dashboard/fleet', icon: Truck, label: 'Kjøretøy', adminOnly: true },
    ]
  },
  {
    label: 'Administrasjon',
    adminOnly: true,
    items: [
      { href: '/dashboard/admin', icon: Shield, label: 'Innstillinger', adminOnly: true },
      { href: '/about', icon: Info, label: 'Om Siden', adminOnly: true },
    ]
  }
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
  const [totalPlacesCount, setTotalPlacesCount] = useState(0);

  // Changed to real-time listener to handle permission propagation delays
  useEffect(() => {
    let unsubscribeOrg: () => void;
    let unsubscribeMessages: () => void;

    if (dbUser?.orgId) {
      setOrgLoading(true);

      // Fetch places count for gamification
      firebaseDB.getPlaces(dbUser.orgId).then(places => {
          setTotalPlacesCount(places.length);
      }).catch(err => console.error("Error fetching places count:", err));
      
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
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg pb-2"
                  >
                    {!isAdmin && totalPlacesCount > 0 && (
                        <div className="px-3 py-3 border-b border-slate-100 mb-1 bg-slate-50/50">
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-1.5">
                                    <Trophy className="h-4 w-4 text-yellow-500" />
                                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Utforsker-status</span>
                                </div>
                                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 rounded-full">
                                    {Math.round(((dbUser?.visitedPlaces?.length || 0) / totalPlacesCount) * 100)}%
                                </span>
                            </div>
                            <Progress value={((dbUser?.visitedPlaces?.length || 0) / totalPlacesCount) * 100} className="h-1.5 bg-slate-200" />
                            <p className="text-[10px] text-muted-foreground mt-1.5 leading-tight">
                                Du har utforsket {dbUser?.visitedPlaces?.length || 0} av {totalPlacesCount} steder i din organisasjon.
                            </p>
                        </div>
                    )}
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive mt-1">
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
            {navGroups.map((group, index) => {
              if (group.adminOnly && !isAdmin) return null;
              
              // Filter items based on roles/admin status
              const visibleItems = group.items.filter(item => {
                  if ((item as any).adminOnly && !isAdmin) return false;
                  if ((item as any).roles && !(item as any).roles.includes(dbUser?.role || '')) return false;
                  return true;
              });

              if (visibleItems.length === 0) return null;

              return (
                  <div key={index} className="mb-4">
                      <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-1 px-4">
                          {group.label}
                      </SidebarGroupLabel>
                      {visibleItems.map((item) => (
                          <SidebarMenuItem key={item.href}>
                              <SidebarMenuButton
                              asChild
                              isActive={pathname === item.href}
                              tooltip={{ children: item.label, className: 'bg-primary' }}
                              onClick={() => setOpenMobile(false)}
                              >
                              <Link href={item.href} className="flex justify-between items-center w-full">
                                  <div className="flex items-center gap-2">
                                     <item.icon className="h-4 w-4" />
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
                      ))}
                  </div>
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