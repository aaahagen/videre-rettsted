const fs = require('fs');

let code = fs.readFileSync('src/app/dashboard/places/[id]/page.tsx', 'utf8');

const oldCode = `                {doorCodeEnabled && place.doorCode && (
                  <section className="bg-white p-5 rounded-xl shadow-sm border">
                      <h2 className="text-xl font-semibold mb-3 flex items-center">
                          <Info className="mr-2 h-5 w-5 text-primary" />
                          {doorCodeLabel}
                      </h2>
                      <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                          {place.doorCode}
                      </p>
                  </section>
                )}`;

const newCode = `                {doorCodeEnabled && place.doorCode && place.doorCode.length > 0 && (
                  <section className="bg-white p-5 rounded-xl shadow-sm border">
                      <h2 className="text-xl font-semibold mb-3 flex items-center">
                          <Info className="mr-2 h-5 w-5 text-primary" />
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
