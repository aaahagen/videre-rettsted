const fs = require('fs');
const path = require('path');

let pagePath = path.join(__dirname, 'src/app/dashboard/workforce/page.tsx');
let pageCode = fs.readFileSync(pagePath, 'utf8');

// 1. Add Lucide imports
pageCode = pageCode.replace(
    /import {([^}]+)} from 'lucide-react';/,
    (match, p1) => {
        if (!p1.includes('ChevronDown')) {
            return `import {${p1}, ChevronDown, ChevronUp } from 'lucide-react';`;
        }
        return match;
    }
);

// 2. Add state and toggle function
const stateHookTarget = "const [editingDriverProfile, setEditingDriverProfile] = useState<DriverProfile | null>(null);";
if (pageCode.includes(stateHookTarget) && !pageCode.includes('expandedCards')) {
    pageCode = pageCode.replace(
        stateHookTarget,
        `${stateHookTarget}\n    const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});\n    const toggleCard = (id: string) => setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));`
    );
}

// 3. Update the map rendering logic
const targetMapLogic = `                            const visibleOverrides = allUpcomingOverrides.slice(0, 3);
                            const hasMoreOverrides = allUpcomingOverrides.length > 3;

                            return (
                                <Card key={driver.id} className="flex flex-col h-full hover:shadow-md transition-shadow relative overflow-hidden group">`;

const replacementMapLogic = `                            const visibleOverrides = allUpcomingOverrides.slice(0, 3);
                            const hasMoreOverrides = allUpcomingOverrides.length > 3;
                            const isExpanded = !!expandedCards[driver.id];

                            return (
                                <Card key={driver.id} className="flex flex-col h-full hover:shadow-md transition-shadow relative overflow-hidden group">`;

if (pageCode.includes(targetMapLogic)) {
    pageCode = pageCode.replace(targetMapLogic, replacementMapLogic);
}

const cardContentRegex = /<CardContent className="pt-0 flex-grow flex flex-col justify-between gap-4">([\s\S]*?)<\/CardContent>/;

const newCardContent = `<CardContent className="pt-0 flex-grow flex flex-col justify-start gap-4">
                                        <div className="space-y-4">
                                            <div 
                                                className="bg-slate-50 hover:bg-slate-100 transition-colors p-2.5 rounded-lg border border-slate-200 flex flex-col items-center justify-center text-center cursor-pointer relative"
                                                onClick={() => toggleCard(driver.id)}
                                            >
                                                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Status {format(searchDate, 'dd.MM')}</span>
                                                <Badge variant="outline" className={cn("text-sm py-1 font-medium", statusInfo.color)}>
                                                    {statusInfo.status}
                                                </Badge>
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                                                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div className="space-y-3 animate-in slide-in-from-top-2 fade-in duration-200">
                                                    {(driver.certifications?.length || driver.skills?.length) ? (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {driver.certifications?.map((c, i) => (
                                                                <span key={i} className="bg-slate-100 px-2 py-0.5 rounded-md border text-xs font-medium text-slate-700">{c}</span>
                                                            ))}
                                                            {driver.skills?.map((s, i) => (
                                                                <span key={i} className="bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 text-xs font-medium text-blue-700">{s}</span>
                                                            ))}
                                                        </div>
                                                    ) : null}

                                                    {visibleOverrides.length > 0 && (
                                                        <div className="space-y-1.5 bg-rose-50/50 p-2 rounded border border-rose-100">
                                                            <span className="flex items-center text-[10px] uppercase font-bold tracking-wider text-rose-600">
                                                                <CalendarDays className="h-3 w-3 mr-1" />
                                                                Kommende fravær
                                                            </span>
                                                            <div className="flex flex-col gap-1 mt-1">
                                                                {visibleOverrides.map(([dateStr, details]) => {
                                                                    let typeLabel = ''; 
                                                                    switch(details.type) { 
                                                                        case 'off': typeLabel = 'Fridag'; break; 
                                                                        case 'vacation': typeLabel = 'Ferie'; break; 
                                                                        case 'sick': typeLabel = 'Sykemelding'; break; 
                                                                        case 'custom': typeLabel = \`\${details.start}-\${details.end}\`; break; 
                                                                    }
                                                                    const [year, month, day] = dateStr.split('-');
                                                                    const localDate = new Date(Number(year), Number(month) - 1, Number(day));
                                                                    
                                                                    return (
                                                                        <div key={dateStr} className="flex justify-between items-center text-xs">
                                                                            <span className="font-medium text-slate-700">{format(localDate, 'dd.MM')}</span>
                                                                            <span className="text-slate-500">{typeLabel}</span>
                                                                        </div>
                                                                    );
                                                                })}
                                                                {hasMoreOverrides && (
                                                                    <span className="text-[10px] text-muted-foreground italic text-center mt-1">...og {allUpcomingOverrides.length - 3} til</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {driver.employmentType === 'external' && driver.agencyInfo && (
                                                        <div className="flex flex-col gap-1 bg-amber-50 text-amber-800 p-2 rounded border border-amber-200 text-xs">
                                                            <span className="font-bold text-[10px] uppercase tracking-wider text-amber-600/80">Byrå Info</span>
                                                            <div className="flex justify-between font-medium">
                                                                <span>{driver.agencyInfo.name}</span>
                                                                {driver.agencyInfo.phone && <span>{driver.agencyInfo.phone}</span>}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {isExpanded && (
                                            <div className="flex items-center justify-between pt-2 border-t mt-auto animate-in fade-in duration-200">
                                                <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
                                                    {driver.documents?.map((doc, i) => (
                                                        <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors px-2 py-1 rounded text-[10px] font-medium shrink-0" title={doc.name}>
                                                            <FileText className="h-3 w-3 shrink-0" />
                                                            <span className="truncate max-w-[60px]">{doc.name.split('.')[0]}</span>
                                                        </a>
                                                    ))}
                                                </div>

                                                {driver.rotation && driver.rotation.startDate && driver.rotation.weeks?.length > 0 && (
                                                    <Button variant="secondary" size="sm" asChild className="h-7 text-xs px-2 shrink-0 ml-2">
                                                        <a href={\`/dashboard/workforce/print?driverId=\${driver.id}&date=\${searchDate.toISOString()}\`} target="_blank" rel="noopener noreferrer">
                                                            <Printer className="mr-1 h-3 w-3" />
                                                            Plan
                                                        </a>
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>`;

pageCode = pageCode.replace(cardContentRegex, newCardContent);

fs.writeFileSync(pagePath, pageCode);
