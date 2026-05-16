'use client';

import { useState, useEffect, useMemo } from 'react';
import { LogEntry, User } from '@/lib/types';
import { firebaseDB } from '@/lib/firebase/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Clock, User as UserIcon, Eye, Download, PlusCircle, Trash2, Loader2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface AuditLogViewerProps {
    orgId: string;
}

export function AuditLogViewer({ orgId }: AuditLogViewerProps) {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [users, setUsers] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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
                // Assuming logs might not be perfectly sorted, sort them newest first
                const sortedLogs = auditLogs.sort((a, b) => {
                    const dateA = a.timestamp instanceof Date ? a.timestamp.getTime() : (a.timestamp as any)?.toDate?.()?.getTime() || 0;
                    const dateB = b.timestamp instanceof Date ? b.timestamp.getTime() : (b.timestamp as any)?.toDate?.()?.getTime() || 0;
                    return dateB - dateA;
                });
                setLogs(sortedLogs);
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

    const getFormattedDate = (timestamp: any) => {
        if (!timestamp) return '---';
        const date = timestamp instanceof Date ? timestamp : (timestamp as any).toDate?.();
        if (!date) return '---';
        return format(date, 'dd.MM.yyyy HH:mm:ss', { locale: nb });
    };

    const filteredLogs = useMemo(() => {
        if (!searchQuery.trim()) return logs;
        
        const lowerQuery = searchQuery.toLowerCase();
        return logs.filter(log => {
            const userName = (users[log.userId] || 'System').toLowerCase();
            const actionLabel = getActionLabel(log.action, log.details).toLowerCase();
            const dateStr = getFormattedDate(log.timestamp).toLowerCase();
            
            return userName.includes(lowerQuery) || 
                   actionLabel.includes(lowerQuery) || 
                   dateStr.includes(lowerQuery);
        });
    }, [logs, searchQuery, users]);

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
            </div>
        );
    }

    return (
        <CardContent className="p-6 space-y-4">
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                    placeholder="Søk på bruker, handling eller dato..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {filteredLogs.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed">
                    <Shield className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Ingen loggførte hendelser {searchQuery ? 'matchet søket' : 'ennå'}.</p>
                </div>
            ) : (
                <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                    <div className="grid grid-cols-12 gap-4 p-4 font-bold bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 border-b">
                        <div className="col-span-4 sm:col-span-3">Tidspunkt</div>
                        <div className="col-span-4 sm:col-span-3">Bruker</div>
                        <div className="col-span-4 sm:col-span-6">Handling</div>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {currentLogs.map((log) => (
                            <div key={log.id} className="grid grid-cols-12 gap-4 p-4 items-center text-xs hover:bg-slate-50 transition-colors">
                                <div className="col-span-4 sm:col-span-3 text-slate-500 font-medium">
                                    {getFormattedDate(log.timestamp)}
                                </div>
                                <div className="col-span-4 sm:col-span-3 flex items-center gap-2">
                                    <UserIcon className="h-3 w-3 text-slate-400 shrink-0" />
                                    <span className="font-bold truncate">{users[log.userId] || 'System'}</span>
                                </div>
                                <div className="col-span-4 sm:col-span-6 flex items-start sm:items-center gap-2">
                                    <div className="mt-0.5 sm:mt-0 shrink-0">
                                        {getActionIcon(log.action)}
                                    </div>
                                    <span className="text-slate-700 leading-snug line-clamp-2 sm:line-clamp-1" title={getActionLabel(log.action, log.details)}>
                                        {getActionLabel(log.action, log.details)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                    <div className="text-xs text-slate-500">
                        Viser {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredLogs.length)} av {filteredLogs.length}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-xs font-medium text-slate-700 min-w-[3rem] text-center">
                            {currentPage} / {totalPages}
                        </span>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
            
            <p className="text-[10px] text-slate-400 italic pt-2">
                * Revisjonsspor lagres for å tilfredsstille krav i GDPR og interne sikkerhetsrutiner. Sletting av logger kan kun utføres av systemeier.
            </p>
        </CardContent>
    );
}
