'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { Loader2, MapPin, Users } from 'lucide-react';

interface AnalyticsDashboardProps {
  orgId: string;
}

export function AnalyticsDashboard({ orgId }: AnalyticsDashboardProps) {
  const [stats, setStats] = useState({
    totalPlaces: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) return;

    setLoading(true);

    const placesQuery = query(collection(db, 'places'), where('orgId', '==', orgId));
    const usersQuery = query(collection(db, 'users'), where('orgId', '==', orgId));

    const unsubscribePlaces = onSnapshot(placesQuery, (snapshot) => {
      setStats(prev => ({ ...prev, totalPlaces: snapshot.size }));
      // We don't set loading to false here because we want to wait for both, 
      // but practically, getting one update is enough to show something.
      // We'll manage a "ready" state more simply.
    });

    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      setStats(prev => ({ ...prev, totalUsers: snapshot.size }));
      setLoading(false); // Assume if we got users, we're good to show
    });

    return () => {
      unsubscribePlaces();
      unsubscribeUsers();
    };
  }, [orgId]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="px-4 sm:px-6 hidden">
        
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1 p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">Steder</span>
            </div>
            <div className="text-2xl font-bold">{stats.totalPlaces}</div>
          </div>
          
          <div className="flex flex-col gap-1 p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Brukere</span>
            </div>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
