'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { firebaseDB } from '@/lib/firebase/database';
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
    const fetchStats = async () => {
      try {
        const [places, users] = await Promise.all([
          firebaseDB.getPlaces(orgId),
          firebaseDB.getUsers(orgId)
        ]);
        
        setStats({
          totalPlaces: places.length,
          totalUsers: users.length
        });
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    if (orgId) {
      fetchStats();
    }
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
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="font-headline text-xl sm:text-2xl">Oversikt</CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
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
