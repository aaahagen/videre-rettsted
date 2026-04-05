const fs = require('fs');
const path = require('path');

let workforcePath = path.join(__dirname, 'src/app/dashboard/workforce/page.tsx');
let workforceContent = fs.readFileSync(workforcePath, 'utf8');

// Add icons for the new fields
const iconsImportSearch = "import { Users, Loader2, Search, Printer, User as UserIcon, FileText, Edit, CalendarDays, UserCheck, Activity, Palmtree, Coffee, Briefcase , ChevronDown, ChevronUp } from 'lucide-react';";
const iconsImportReplacement = "import { Users, Loader2, Search, Printer, User as UserIcon, FileText, Edit, CalendarDays, UserCheck, Activity, Palmtree, Coffee, Briefcase , ChevronDown, ChevronUp, MapPin, Phone, AlertCircle } from 'lucide-react';";

if (workforceContent.includes(iconsImportSearch)) {
    workforceContent = workforceContent.replace(iconsImportSearch, iconsImportReplacement);
}

// Add the new fields to the expanded view
const expandedViewSearch = `{driver.employmentType === 'external' && driver.agencyInfo && (`;
const newFieldsBlock = `
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
                                                        {driver.emergencyContact && (
                                                            <div className="flex items-start gap-2 sm:col-span-2">
                                                                <AlertCircle className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Nødkontakt</p>
                                                                    <p className="text-sm font-medium text-slate-900 leading-tight">{driver.emergencyContact}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
`;

workforceContent = workforceContent.replace(expandedViewSearch, newFieldsBlock + expandedViewSearch);

fs.writeFileSync(workforcePath, workforceContent);
console.log("Updated workforce profile view");
