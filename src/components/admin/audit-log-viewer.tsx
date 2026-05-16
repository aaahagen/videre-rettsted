'use client';

import { useState, useEffect } from 'react';
import { LogEntry, User } from '@/lib/types';
import { firebaseDB } from '@/lib/firebase/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Clock, User as UserIcon, Eye, Download, PlusCircle, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface AuditLogViewerProps {
    orgId: string;
}

export function AuditLogViewer({ orgId }: AuditLogViewerProps) {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [users, setUsers] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            setIsLoading(true);
            try {
                const [auditLogs, allUsers] = await Promise.all([
                    firebaseDB.getLogs(orgId),
                    firebaseDB.getUsers(orgId)
                ]);

                // Create a mapping of user IDs to names for easier display
                const userMap: Record<string, string> = {};
                allUsers.forEach(u => {
                    userMap[u.id] = u.name || u.email;
                });
                setUsers(userMap);
                setLogs(auditLogs);
            } catch (error) {
                console.error("Failed to fetch audit logs", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (orgId) fetchLogs();
    }, [orgId]);

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'view_sensitive_personnel_data': return <Eye className="h-4 w-4 text-amber-500" />;
            case 'export_hr_data': return <Download className="h-4 w-4 text-blue-500" />;
            case 'create_place': return <PlusCircle className="h-4 w-4 text-emerald-500" />;
            case 'delete_place': return <Trash2 className="h-4 w-4 text-red-500" />;
            case 'login': return <Clock className="h-4 w-4 text-slate-400" />;
            default: return <Shield className="h-4 w-4 text-slate-400" />;
        }
    };

    const getActionLabel = (action: string, details?: any) => {
        switch (action) {
            case 'view_sensitive_personnel_data': 
                return `Viste sensitive personopplysninger for ${details?.targetUserName || 'en ansatt'}`;
            case 'export_hr_data': 
                return 'Eksporterte personell-liste (CSV)';
            case 'create_place': 
                return `Opprettet nytt leveringssted: ${details?.name || ''}`;
            case 'delete_place': 
                return `Slettet leveringssted: ${details?.name || ''}`;
            case 'login': 
                return 'Logget inn i systemet';
            case 'admin_view_worklog':
                return `Viste timelister for ${details?.targetUserName || 'en ansatt'}`;
            default: return action.replace(/_/g, ' ');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {logs.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed">
                    <Shield className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Ingen loggførte hendelser ennå.</p>
                </div>
            ) : (
                <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                    <div className="grid grid-cols-12 gap-4 p-4 font-bold bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 border-b">
                        <div className="col-span-3">Tidspunkt</div>
                        <div className="col-span-3">Bruker</div>
                        <div className="col-span-6">Handling</div>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                        {logs.map((log) => (
                            <div key={log.id} className="grid grid-cols-12 gap-4 p-4 items-center text-xs hover:bg-slate-50 transition-colors">
                                <div className="col-span-3 text-slate-500 font-medium">
                                    {log.timestamp ? format(log.timestamp instanceof Date ? log.timestamp : (log.timestamp as any).toDate(), 'dd.MM HH:mm:ss', { locale: nb }) : '---'}
                                </div>
                                <div className="col-span-3 flex items-center gap-2">
                                    <UserIcon className="h-3 w-3 text-slate-400" />
                                    <span className="font-bold truncate">{users[log.userId] || 'System'}</span>
                                </div>
                                <div className="col-span-6 flex items-center gap-2">
                                    {getActionIcon(log.action)}
                                    <span className="text-slate-700">{getActionLabel(log.action, log.details)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <p className="text-[10px] text-slate-400 italic">
                * Revisjonsspor lagres for å tilfredsstille krav i GDPR og interne sikkerhetsrutiner. Sletting av logger kan kun utføres av systemeier.
            </p>
        </div>
    );
}
