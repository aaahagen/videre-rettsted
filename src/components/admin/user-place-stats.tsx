'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { Loader2, MapPin, Users, Award } from 'lucide-react';
import { User, Place } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserPlaceStatsProps {
  orgId: string;
}

interface UserStat extends User {
  placeCount: number;
}

export function UserPlaceStats({ orgId }: UserPlaceStatsProps) {
  const [userStats, setUserStats] = useState<UserStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) return;

    setLoading(true);

    const usersQuery = query(collection(db, 'users'), where('orgId', '==', orgId));
    const placesQuery = query(collection(db, 'places'), where('orgId', '==', orgId));

    let users: User[] = [];
    let places: Place[] = [];

    const updateStats = () => {
      const stats = users.map(user => {
        const count = places.filter(place => place.createdBy === user.id).length;
        return { ...user, placeCount: count };
      });
      // Sort by place count descending
      stats.sort((a, b) => b.placeCount - a.placeCount);
      setUserStats(stats);
      setLoading(false);
    };

    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      updateStats();
    });

    const unsubscribePlaces = onSnapshot(placesQuery, (snapshot) => {
      places = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Place));
      updateStats();
    });

    return () => {
      unsubscribeUsers();
      unsubscribePlaces();
    };
  }, [orgId]);

  if (loading) {
    return (
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-sm font-black text-slate-800 uppercase tracking-tight">Bidragsytere</CardTitle>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Steder opprettet per bruker</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100">
          {userStats.length > 0 ? (
            userStats.map((user, index) => (
              <div key={user.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10 border border-slate-200">
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                      <AvatarFallback className="bg-indigo-50 text-indigo-600 font-bold">
                        {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : '??'}
                      </AvatarFallback>
                    </Avatar>
                    {index < 3 && (
                      <div className={cn(
                        "absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white",
                        index === 0 ? "bg-yellow-400 text-yellow-900" : 
                        index === 1 ? "bg-slate-300 text-slate-700" : 
                        "bg-amber-600 text-white"
                      )}>
                        {index + 1}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{user.name}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{user.role}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100">
                    <MapPin className="h-3 w-3" />
                    <span className="text-sm font-black">{user.placeCount}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-400">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p className="text-xs font-bold uppercase tracking-tight">Ingen brukere funnet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
