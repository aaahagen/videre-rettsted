'use client';

import { useAuth } from "@/components/auth-provider";
import { useEffect, useState } from "react";
import { Organization } from "@/lib/types";
import { firebaseDB } from "@/lib/firebase/database";
import { HMSLog } from "./hms-log";
import { HMSSettings } from "./hms-settings";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert, Lock } from "lucide-react";
import { useSearch } from "@/hooks/use-search";
import { useRouter } from "next/navigation";

export default function HMSPage() {
    const { dbUser, loading } = useAuth();
    const [organization, setOrganization] = useState<Organization | null>(null);
    const { query: searchQuery, setContext } = useSearch();
    const router = useRouter();

    useEffect(() => {
        setContext('HMS-Logg', '');
    }, [setContext]);

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

    // Module Gating: If HMS module is disabled, show "Module Locked" state
    if (organization.modules?.hms !== true) {
        return (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                <div className="p-4 bg-slate-50 rounded-full mb-4">
                    <Lock className="h-12 w-12 text-slate-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Modulen er utilgjengelig</h2>
                <p className="max-w-md mx-auto">HMS-modulen er ikke aktivert for din organisasjon. Ta kontakt med administrator for å oppgradere din plan.</p>
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-headline px-1">HMS & Sikkerhet</h1>
                        <p className="text-muted-foreground px-1 mt-1 text-sm">Dokumentasjon og sjekklister for leveringssteder.</p>
                    </div>
                </div>

                <HMSSettings organization={organization} />
                <HMSLog orgId={organization.id} organization={organization} initialSearchQuery={searchQuery} />
            </div>
        </div>
    );
}