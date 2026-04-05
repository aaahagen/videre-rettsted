const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/app/dashboard/workforce/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// 1. Update imports
const importSearch = "ChevronUp, MapPin, Phone, AlertCircle, Heart, Baby, CalendarClock, StickyNote } from 'lucide-react';";
const importReplacement = "ChevronUp, MapPin, Phone, AlertCircle, Heart, Baby, CalendarClock, StickyNote, Hash, Building2, UserCircle2, Briefcase, GraduationCap, Banknote, Landmark, BookOpenCheck, ShieldCheck } from 'lucide-react';";
content = content.replace(importSearch, importReplacement);

// 2. Add all new HR fields to expanded view
const expandedViewSearch = `                                                        {driver.adminNotes && (
                                                            <div className="flex items-start gap-2 sm:col-span-2 mt-1 pt-2 border-t border-slate-200">
                                                                <StickyNote className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Admin Notat</p>
                                                                    <p className="text-sm font-medium text-slate-800 leading-snug whitespace-pre-wrap">{driver.adminNotes}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>`;

const newFieldsBlock = `                                                        {driver.dateOfBirth && (
                                                            <div className="flex items-start gap-2 mt-2 pt-2 border-t border-slate-200">
                                                                <UserCircle2 className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fødselsdato</p>
                                                                    <p className="text-sm font-medium text-slate-900 leading-tight">{format(new Date(driver.dateOfBirth), 'dd.MM.yyyy')}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {driver.socialSecurityNumber && (
                                                            <div className="flex items-start gap-2 mt-2 pt-2 border-t border-slate-200">
                                                                <Hash className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Personnummer</p>
                                                                    <p className="text-sm font-medium text-slate-900 leading-tight">{driver.socialSecurityNumber}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {driver.gender && (
                                                            <div className="flex items-start gap-2 mt-2 pt-2 border-t border-slate-200">
                                                                <UserIcon className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kjønn</p>
                                                                    <p className="text-sm font-medium text-slate-900 leading-tight">
                                                                        {driver.gender === 'male' ? 'Mann' : driver.gender === 'female' ? 'Kvinne' : driver.gender === 'other' ? 'Annet' : 'Ønsker ikke oppgi'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {driver.employeeId && (
                                                            <div className="flex items-start gap-2 mt-2 pt-2 border-t border-slate-200">
                                                                <Briefcase className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ansattnummer</p>
                                                                    <p className="text-sm font-medium text-slate-900 leading-tight">{driver.employeeId}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {driver.jobTitle && (
                                                            <div className="flex items-start gap-2 mt-2 pt-2 border-t border-slate-200">
                                                                <Briefcase className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Stilling</p>
                                                                    <p className="text-sm font-medium text-slate-900 leading-tight">{driver.jobTitle}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {driver.department && (
                                                            <div className="flex items-start gap-2 mt-2 pt-2 border-t border-slate-200">
                                                                <Building2 className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Avdeling</p>
                                                                    <p className="text-sm font-medium text-slate-900 leading-tight">{driver.department}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {driver.supervisor && (
                                                            <div className="flex items-start gap-2 mt-2 pt-2 border-t border-slate-200">
                                                                <UserCheck className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Leder</p>
                                                                    <p className="text-sm font-medium text-slate-900 leading-tight">{driver.supervisor}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {driver.employmentStatus && (
                                                            <div className="flex items-start gap-2 mt-2 pt-2 border-t border-slate-200">
                                                                <Briefcase className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</p>
                                                                    <p className="text-sm font-medium text-slate-900 leading-tight">
                                                                        {driver.employmentStatus === 'full-time' ? 'Heltid' : driver.employmentStatus === 'part-time' ? 'Deltid' : driver.employmentStatus === 'temporary' ? 'Midlertidig' : 'Tilkalling'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {driver.probationEndDate && (
                                                            <div className="flex items-start gap-2 mt-2 pt-2 border-t border-slate-200">
                                                                <GraduationCap className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Prøvetid Utløper</p>
                                                                    <p className="text-sm font-medium text-slate-900 leading-tight">{format(new Date(driver.probationEndDate), 'dd.MM.yyyy')}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {driver.hourlyRate && (
                                                            <div className="flex items-start gap-2 mt-2 pt-2 border-t border-slate-200">
                                                                <Banknote className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Lønn</p>
                                                                    <p className="text-sm font-medium text-slate-900 leading-tight">{driver.hourlyRate} kr</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {driver.bankAccountNumber && (
                                                            <div className="flex items-start gap-2 mt-2 pt-2 border-t border-slate-200">
                                                                <Landmark className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kontonummer</p>
                                                                    <p className="text-sm font-medium text-slate-900 leading-tight">{driver.bankAccountNumber}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {driver.taxCode && (
                                                            <div className="flex items-start gap-2 mt-2 pt-2 border-t border-slate-200">
                                                                <FileText className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Skattekort</p>
                                                                    <p className="text-sm font-medium text-slate-900 leading-tight">{driver.taxCode}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {driver.backgroundCheckDate && (
                                                            <div className="flex items-start gap-2 mt-2 pt-2 border-t border-slate-200">
                                                                <ShieldCheck className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bakgrunnssjekk</p>
                                                                    <p className="text-sm font-medium text-slate-900 leading-tight">{format(new Date(driver.backgroundCheckDate), 'dd.MM.yyyy')}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {driver.staffHandbookAcknowledged && (
                                                            <div className="flex items-start gap-2 mt-2 pt-2 border-t border-slate-200 sm:col-span-2">
                                                                <BookOpenCheck className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Personalhåndbok</p>
                                                                    <p className="text-sm font-medium text-slate-900 leading-tight">Lest og akseptert</p>
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

content = content.replace(expandedViewSearch, newFieldsBlock);

// The display condition should be expanded to include all fields
const conditionalSearch = `(driver.phone || driver.address || driver.emergencyContact || driver.nextOfKin || driver.children || driver.seniorityDate || driver.adminNotes) && (`;
const conditionalReplace = `(driver.phone || driver.address || driver.emergencyContact || driver.nextOfKin || driver.children || driver.seniorityDate || driver.adminNotes || driver.dateOfBirth || driver.socialSecurityNumber || driver.employeeId || driver.jobTitle || driver.department || driver.supervisor || driver.employmentStatus || driver.probationEndDate || driver.hourlyRate || driver.bankAccountNumber || driver.taxCode || driver.backgroundCheckDate || driver.staffHandbookAcknowledged) && (`;

content = content.replace(conditionalSearch, conditionalReplace);

fs.writeFileSync(pagePath, content);
console.log("Updated workforce page to display all new HR fields");
