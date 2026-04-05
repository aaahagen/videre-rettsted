const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/app/dashboard/workforce/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// 1. Update imports to include new icons
const importSearch = "ChevronUp, MapPin, Phone, AlertCircle } from 'lucide-react';";
const importReplacement = "ChevronUp, MapPin, Phone, AlertCircle, Heart, Baby, CalendarClock, StickyNote } from 'lucide-react';";
if (content.includes(importSearch)) {
    content = content.replace(importSearch, importReplacement);
} else {
    // try fallback import replacement
    content = content.replace("import { Users, Loader2", "import { Users, Loader2, Heart, Baby, CalendarClock, StickyNote");
}

// 2. Replace the existing new fields block with a comprehensive one
const blockSearch = `<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 mb-3">`;
const blockEndSearch = `                                                    {driver.employmentType === 'external' && driver.agencyInfo && (`;

const newBlock = `{dbUser?.role === 'admin' && (driver.phone || driver.address || driver.emergencyContact || driver.nextOfKin || driver.children || driver.seniorityDate || driver.adminNotes) && (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 mb-3">
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
                                                        {driver.seniorityDate && (
                                                            <div className="flex items-start gap-2">
                                                                <CalendarClock className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ansatt Siden</p>
                                                                    <p className="text-sm font-medium text-slate-900 leading-tight">{format(new Date(driver.seniorityDate), 'dd.MM.yyyy')}</p>
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
                                                        {driver.children && (
                                                            <div className="flex items-start gap-2 sm:col-span-2">
                                                                <Baby className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Barn</p>
                                                                    <p className="text-sm font-medium text-slate-900 leading-tight">{driver.children}</p>
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
                                                    </div>
                                                    )}

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
                                                    )}

`;

// Extract everything between the blockSearch and the blockEndSearch to replace it
const startIdx = content.indexOf(blockSearch);
if (startIdx !== -1) {
    const endIdx = content.indexOf(blockEndSearch, startIdx);
    if (endIdx !== -1) {
        const oldContent = content.substring(startIdx, endIdx);
        content = content.replace(oldContent, newBlock);
    }
}

fs.writeFileSync(pagePath, content);
console.log("Updated workforce page expanded view");
