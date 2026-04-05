const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/workforce/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const anchor = '{driver.emergencyContact && (';

const missingFields = `
                                                                {driver.socialSecurityNumber && (
                                                                    <div className="flex items-start gap-2">
                                                                        <Hash className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                                        <div>
                                                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Personnummer</p>
                                                                            <p className="text-sm font-medium text-slate-900 leading-tight">{driver.socialSecurityNumber}</p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {driver.dateOfBirth && (
                                                                    <div className="flex items-start gap-2">
                                                                        <Baby className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                                        <div>
                                                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fødselsdato</p>
                                                                            <p className="text-sm font-medium text-slate-900 leading-tight">{format(new Date(driver.dateOfBirth), 'dd.MM.yyyy')}</p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {driver.bankAccountNumber && (
                                                                    <div className="flex items-start gap-2">
                                                                        <Landmark className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                                        <div>
                                                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bankkonto</p>
                                                                            <p className="text-sm font-medium text-slate-900 leading-tight">{driver.bankAccountNumber}</p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {driver.taxCode && (
                                                                    <div className="flex items-start gap-2">
                                                                        <FileText className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                                        <div>
                                                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Skattekort</p>
                                                                            <p className="text-sm font-medium text-slate-900 leading-tight">{driver.taxCode}</p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {driver.supervisor && (
                                                                    <div className="flex items-start gap-2">
                                                                        <UserCircle2 className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                                        <div>
                                                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nærmeste Leder</p>
                                                                            <p className="text-sm font-medium text-slate-900 leading-tight">{driver.supervisor}</p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {driver.probationEndDate && (
                                                                    <div className="flex items-start gap-2">
                                                                        <CalendarClock className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                                        <div>
                                                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Prøvetid Utløper</p>
                                                                            <p className="text-sm font-medium text-slate-900 leading-tight">{format(new Date(driver.probationEndDate), 'dd.MM.yyyy')}</p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {driver.backgroundCheckDate && (
                                                                    <div className="flex items-start gap-2">
                                                                        <ShieldCheck className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                                        <div>
                                                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bakgrunnssjekk</p>
                                                                            <p className="text-sm font-medium text-slate-900 leading-tight">{format(new Date(driver.backgroundCheckDate), 'dd.MM.yyyy')}</p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {driver.staffHandbookAcknowledged !== undefined && (
                                                                    <div className="flex items-start gap-2">
                                                                        <BookOpenCheck className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                                        <div>
                                                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Personalhåndbok</p>
                                                                            <p className="text-sm font-medium text-slate-900 leading-tight">{driver.staffHandbookAcknowledged ? 'Akseptert' : 'Ikke Akseptert'}</p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                `;

content = content.replace(anchor, missingFields + anchor);

fs.writeFileSync(filePath, content);
console.log('Added missing fields');
