'use client';

import { useAuth } from "@/components/auth-provider";
import { useEffect, useState } from "react";
import { Organization } from "@/lib/types";
import { firebaseDB } from "@/lib/firebase/database";
import { HMSLog } from "./hms-log";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert } from "lucide-react";

export default function HMSPage() {
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

    if (dbUser?.role !== 'admin' && dbUser?.role !== 'super_admin' && dbUser?.role !== 'owner' && dbUser?.role !== 'hms_responsible') {
        return (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                <ShieldAlert className="h-12 w-12 text-red-500/50 mb-4" />
                <h2 className="text-xl font-bold text-slate-800">Ingen tilgang</h2>
                <p>Du har ikke rettigheter til å se denne siden.</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-x-hidden w-full">
            <div className="space-y-6 sm:space-y-8">
                <div>
                    <h1 className="text-3xl font-bold font-headline px-1">HMS & Sikkerhet</h1>
                    <p className="text-muted-foreground px-1 mt-1 text-sm">Dokumentasjon og sjekklister for leveringssteder.</p>
                </div>

                <HMSLog orgId={organization.id} organization={organization} />
            </div>
        </div>
    );
}