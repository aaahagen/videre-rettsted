const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/app/dashboard/workforce/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// I also need to close the `)` at the end of the big block of new fields
const endSearch = `                                                        {driver.adminNotes && (
                                                            <div className="flex items-start gap-2 sm:col-span-2 mt-1 pt-2 border-t border-slate-200">
                                                                <StickyNote className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Admin Notat</p>
                                                                    <p className="text-sm font-medium text-slate-800 leading-snug whitespace-pre-wrap">{driver.adminNotes}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>`;
const endReplacement = `                                                        {driver.adminNotes && (
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
                                                    )}`;

if (content.includes(endSearch)) {
    content = content.replace(endSearch, endReplacement);
}

fs.writeFileSync(pagePath, content);
console.log("Closed the conditional in expanded view");
