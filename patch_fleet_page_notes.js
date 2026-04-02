const fs = require('fs');
const file = 'src/app/dashboard/fleet/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetDimensions = `                                        {(v.dimensions?.height || v.dimensions?.width || v.dimensions?.length) && (
                                            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                                                
                                                {v.dimensions.height && <span title="Høyde">H: {v.dimensions.height}m</span>}
                                                {v.dimensions.width && <span title="Bredde">B: {v.dimensions.width}m</span>}
                                                {v.dimensions.length && <span title="Lengde">L: {v.dimensions.length}m</span>}
                                            </div>
                                        )}`;

const newDimensions = `                                        {(v.dimensions?.height || v.dimensions?.width || v.dimensions?.length) && (
                                            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                                                {v.dimensions.height && <span title="Høyde">H: {v.dimensions.height}m</span>}
                                                {v.dimensions.width && <span title="Bredde">B: {v.dimensions.width}m</span>}
                                                {v.dimensions.length && <span title="Lengde">L: {v.dimensions.length}m</span>}
                                            </div>
                                        )}
                                        
                                        {(v.capacity?.notes || v.capabilities?.notes) && (
                                            <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                                                {v.capacity?.notes && (
                                                    <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-md">
                                                        <span className="font-semibold block mb-0.5 text-slate-700">Kapasitet info:</span>
                                                        <span className="whitespace-pre-wrap">{v.capacity.notes}</span>
                                                    </div>
                                                )}
                                                {v.capabilities?.notes && (
                                                    <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-md">
                                                        <span className="font-semibold block mb-0.5 text-slate-700">Utstyr info:</span>
                                                        <span className="whitespace-pre-wrap">{v.capabilities.notes}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}`;

content = content.replace(targetDimensions, newDimensions);

fs.writeFileSync(file, content);
