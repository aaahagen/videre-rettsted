const fs = require('fs');
const path = require('path');

let workforcePath = path.join(__dirname, 'src/app/dashboard/workforce/page.tsx');
let workforceCode = fs.readFileSync(workforcePath, 'utf8');

const regex = /<Card className="bg-white">\s*<CardHeader className="pb-3 border-b">[\s\S]*?<\/CardContent>\s*<\/Card>/;

const replacement = `<div className="flex flex-col sm:flex-row gap-4 items-end justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="space-y-2 w-full sm:w-auto max-w-full">
                        <Label className="text-sm font-semibold text-slate-700">Velg dato for oversikt</Label>
                        <Input 
                            type="date"
                            value={searchDateStr}
                            onChange={(e) => setSearchDateStr(e.target.value)}
                            className="w-full max-w-full sm:w-[240px] bg-slate-50 border-slate-300"
                        />
                    </div>
                </div>

                {filteredDrivers.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-slate-200">
                        <div className="rounded-full bg-slate-100 p-6 mb-4">
                            <Search className="h-12 w-12 text-slate-300" />
                        </div>
                        <h2 className="text-xl font-semibold text-slate-900">Ingen funnet.</h2>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDrivers.map(driver => {
                            const statusInfo = getDriverStatus(driver, searchDate);
                            
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            
                            const allUpcomingOverrides = driver.scheduleOverrides 
                                ? Object.entries(driver.scheduleOverrides)
                                    .filter(([dateStr]) => {
                                        const [year, month, day] = dateStr.split('-');
                                        const overrideDate = new Date(Number(year), Number(month) - 1, Number(day));
                                        return overrideDate >= today;
                                    })
                                    .sort(([a], [b]) => a.localeCompare(b))
                                : [];
                                
                            const visibleOverrides = allUpcomingOverrides.slice(0, 3);
                            const hasMoreOverrides = allUpcomingOverrides.length > 3;

                            return (
                                <Card key={driver.id} className="flex flex-col h-full hover:shadow-md transition-shadow relative overflow-hidden group">
                                    {dbUser?.role === 'admin' && (
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="absolute top-2 right-2 text-slate-400 hover:text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                            onClick={() => setEditingDriverProfile(driver)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <div className={\`h-1.5 w-full \${statusInfo.type === 'working' ? 'bg-blue-500' : statusInfo.type === 'sick' ? 'bg-red-500' : statusInfo.type === 'vacation' ? 'bg-green-500' : 'bg-slate-300'}\`} />
                                    
                                    <CardHeader className="pb-3 flex flex-row items-start gap-4">
                                        <div className="relative h-14 w-14 shrink-0 rounded-full overflow-hidden border-2 border-white shadow-sm bg-slate-100 flex items-center justify-center">
                                            {(driver.images && driver.images.length > 0 && driver.images[0].url) ? (
                                                <Image
                                                    src={driver.images[0].url}
                                                    alt={driver.name || driver.email}
                                                    fill
                                                    sizes="56px"
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <UserIcon className="h-6 w-6 text-slate-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 pr-6">
                                            <CardTitle className="text-lg font-bold truncate" title={driver.name || driver.email}>
                                                {driver.name || driver.email}
                                            </CardTitle>
                                            <div className="flex items-center mt-1">
                                                {driver.employmentType === 'external' ? (
                                                    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] px-1.5 py-0">
                                                        Innleid
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 text-[10px] px-1.5 py-0">
                                                        Fast
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="pt-0 flex-grow flex flex-col justify-between gap-4">
                                        <div className="space-y-4">
                                            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center">
                                                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Status {format(searchDate, 'dd.MM')}</span>
                                                <Badge variant="outline" className={cn("text-sm py-1 font-medium", statusInfo.color)}>
                                                    {statusInfo.status}
                                                </Badge>
                                            </div>

                                            <div className="space-y-3">
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
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t mt-auto">
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
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}`;

if (workforceCode.match(regex)) {
    workforceCode = workforceCode.replace(regex, replacement);
}

fs.writeFileSync(workforcePath, workforceCode);
