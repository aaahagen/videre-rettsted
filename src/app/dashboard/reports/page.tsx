'use client';

import { useAuth } from "@/components/auth-provider";
import { useEffect, useState } from "react";
import { Organization, Place } from "@/lib/types";
import { firebaseDB } from "@/lib/firebase/database";
import { Skeleton } from "@/components/ui/skeleton";
import { PlaceCard } from "@/components/places/place-card";

export default function ReportsPage() {
    const { dbUser, loading } = useAuth();
    const [organization, setOrganization] = useState<Organization | null>(null);

    useEffect(() => {
        if (dbUser?.orgId) {
            firebaseDB.getOrganization(dbUser.orgId).then(setOrganization);
        }
    }, [dbUser]);

    if (loading || !organization) {
        return (
            <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
                <Skeleton className="h-10 w-48 mb-6" />
                <Skeleton className="h-64 w-full rounded-xl" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-x-hidden w-full">
            <div className="space-y-6 sm:space-y-8">
                <div>
                    <h1 className="text-3xl font-bold font-headline px-1">Avviksrapporter</h1>
                    <p className="text-muted-foreground px-1 mt-1 text-sm">Håndtering av rapporterte farer og avvik på leveringssteder.</p>
                </div>

                <div className="p-12 text-center border-2 border-dashed rounded-xl text-slate-500">
                    Avviksrapportering er under utvikling.
                </div>
            </div>
        </div>
    );
}