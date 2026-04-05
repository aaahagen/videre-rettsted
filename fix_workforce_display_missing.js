const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/app/dashboard/workforce/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// I seem to have lost the new fields when fixing the JSX error. 
// Let's re-add them correctly.

const oldBlockSearch = `<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 mb-3">
                                                        {driver.phone && (
                                                            <div className="flex items-start gap-2">
                                                                <Phone className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Telefon</p>
                                                                    <a href={\`tel:\${driver.phone}\`} className="text-sm font-medium text-slate-900 hover:text-primary transition-colors">{driver.phone}</a>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {driver.address && (
                                                            <div className="flex items-start gap-2">
                                                                <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Adresse</p>
                                                                    <p className="text-sm font-medium text-slate-900 leading-tight">{driver.address}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {driver.emergencyContact && (
                                                            <div className="flex items-start gap-2 sm:col-span-2">
                                                                <AlertCircle className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Nødkontakt</p>
                                                                    <p className="text-sm font-medium text-slate-900 leading-tight">{driver.emergencyContact}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>`;

const newBlockReplacement = `<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 bg-slate-50 p-3 rounded-lg border border-slate-200 mb-3">
                                                        {driver.phone && (
                                                            <div className="flex items-start gap-2">
                                                                <Phone className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Telefon</p>
                                                                    <a href={\`tel:\${driver.phone}\`} className="text-sm font-medium text-slate-900 hover:text-primary transition-colors">{driver.phone}</a>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {driver.address && (
                                                            <div className="flex items-start gap-2">
                                                                <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Adresse</p>
                                                                    <p className="text-sm font-medium text-slate-900 leading-tight">{driver.address}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {driver.employeeId && (
                                                            <div className="flex items-start gap-2">
                                                                <Hash className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ansattnr</p>
                                                                    <p className="text-sm font-medium text-slate-900 leading-tight">{driver.employeeId}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {driver.jobTitle && (
                                                            <div className="flex items-start gap-2">
                                                                <Briefcase className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Stilling</p>
                                                                    <p className="text-sm font-medium text-slate-900 leading-tight">{driver.jobTitle}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {driver.department && (
                                                            <div className="flex items-start gap-2">
                                                                <Building2 className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Avdeling</p>
                                                                    <p className="text-sm font-medium text-slate-900 leading-tight">{driver.department}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {driver.employmentStatus && (
                                                            <div className="flex items-start gap-2">
                                                                <UserCheck className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</p>
                                                                    <p className="text-sm font-medium text-slate-900 leading-tight">
                                                                        {driver.employmentStatus === 'full-time' ? 'Heltid' : driver.employmentStatus === 'part-time' ? 'Deltid' : driver.employmentStatus === 'temporary' ? 'Midlertidig' : 'Tilkalling'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {driver.seniorityDate && (
                                                            <div className="flex items-start gap-2">
                                                                <CalendarClock className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ansatt Siden</p>
                                                                    <p className="text-sm font-medium text-slate-900 leading-tight">{format(new Date(driver.seniorityDate), 'dd.MM.yyyy')}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {driver.hourlyRate && (
                                                            <div className="flex items-start gap-2">
                                                                <Banknote className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Lønn</p>
                                                                    <p className="text-sm font-medium text-slate-900 leading-tight">{driver.hourlyRate} kr</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {driver.emergencyContact && (
                                                            <div className="flex items-start gap-2">
                                                                <AlertCircle className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Nødkontakt</p>
                                                                    <p className="text-sm font-medium text-slate-900 leading-tight">{driver.emergencyContact}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {driver.nextOfKin && (
                                                            <div className="flex items-start gap-2">
                                                                <Heart className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Pårørende</p>
                                                                    <p className="text-sm font-medium text-slate-900 leading-tight">{driver.nextOfKin}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {driver.adminNotes && (
                                                            <div className="flex items-start gap-2 sm:col-span-2 mt-1 pt-2 border-t border-slate-200">
                                                                <StickyNote className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Admin Notat</p>
                                                                    <p className="text-sm font-medium text-slate-800 leading-snug whitespace-pre-wrap">{driver.adminNotes}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>`;

content = content.replace(oldBlockSearch, newBlockReplacement);

// Re-add the contracts section if missing
if (!content.includes('Kontrakter ({driver.contracts.length})')) {
    const contractsBlock = `
                                                    {dbUser?.role === 'admin' && driver.contracts && driver.contracts.length > 0 && (
                                                        <div className="space-y-1.5 bg-slate-50 p-2 rounded-lg border border-slate-200 mb-3">
                                                            <span className="flex items-center text-[10px] uppercase font-bold tracking-wider text-slate-500">
                                                                <FileText className="h-3 w-3 mr-1" />
                                                                Kontrakter ({driver.contracts.length})
                                                            </span>
                                                            <div className="flex flex-col gap-1.5 mt-1">
                                                                {[...driver.contracts].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).map(contract => (
                                                                    <div key={contract.id} className="flex justify-between items-center text-xs bg-white p-2 rounded border border-slate-100">
                                                                        <div className="flex flex-col">
                                                                            <span className="font-bold text-slate-700">{contract.role}</span>
                                                                            <span className="text-slate-500">{format(new Date(contract.startDate), 'dd.MM.yy')} - {contract.endDate ? format(new Date(contract.endDate), 'dd.MM.yy') : 'Pågående'}</span>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <span className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">{contract.contractedHours} t/uke</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}`;
    content = content.replace(newBlockReplacement + "\n                                                    )}", newBlockReplacement + "\n                                                    )}" + contractsBlock);
}

fs.writeFileSync(pagePath, content);
console.log("Fixed missing HR fields in view");
