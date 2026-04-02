const fs = require('fs');
const file = 'src/app/dashboard/fleet/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetNotes = `                                        {(v.capacity?.notes || v.capabilities?.notes) && (`;
const newDisplay = `                                        {v.capabilities?.customFields && v.capabilities.customFields.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
                                                {v.capabilities.customFields.map((field, idx) => (
                                                    <div key={idx} className="bg-slate-50 border border-slate-100 px-2 py-1 rounded text-[10px] flex flex-col">
                                                        <span className="text-muted-foreground font-semibold uppercase tracking-tighter">{field.name}</span>
                                                        <span className="text-slate-700 font-bold">{field.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {(v.capacity?.notes || v.capabilities?.notes) && (`;

content = content.replace(targetNotes, newDisplay);
fs.writeFileSync(file, content);
