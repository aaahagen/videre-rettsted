const fs = require('fs');

let code = fs.readFileSync('src/app/dashboard/places/[id]/page.tsx', 'utf8');

const oldCode = `                    {doorCodeEnabled && place.doorCode && (
                    <section className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                            <Info className="mr-2 h-4 w-4" />
                            {doorCodeLabel}
                        </h2>
                        <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                           {place.doorCode}
                        </p>
                    </section>
                 )}`;

const newCode = `                    {doorCodeEnabled && place.doorCode && place.doorCode.length > 0 && (
                    <section className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                            <Info className="mr-2 h-4 w-4" />
                            {doorCodeLabel}
                        </h2>
                        <div className="grid gap-2">
                            {place.doorCode.map((dc, idx) => (
                                <div key={idx} className="bg-white border px-3 py-2 rounded text-sm flex justify-between items-center gap-2">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-muted-foreground uppercase">{dc.category}</span>
                                        <span className="font-medium text-slate-700">{dc.name}</span>
                                    </div>
                                    <span className="font-mono font-bold text-primary">{dc.value}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                 )}`;

code = code.replace(oldCode, newCode);

fs.writeFileSync('src/app/dashboard/places/[id]/page.tsx', code);
