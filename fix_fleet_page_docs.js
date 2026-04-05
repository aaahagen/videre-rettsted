const fs = require('fs');
const file = 'src/app/dashboard/fleet/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// I will remove the small tooltip doc counter from the header area
const targetTooltip = `                                            {v.documents && v.documents.length > 0 && (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <span className="flex items-center gap-1 ml-auto text-primary cursor-pointer bg-primary/10 px-2 py-0.5 rounded-full text-xs font-medium">
                                                            <FileText className="h-3 w-3" /> {v.documents.length} doc
                                                        </span>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{v.documents.length} dokument(er) lastet opp</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            )}`;

content = content.replace(targetTooltip, '');

// And add a new distinct section at the bottom of the card content for the clickable documents
const targetDocsBottom = `                                        {(v.capacity?.notes || v.capabilities?.notes) && (
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

const newDocsBottom = `                                        {(v.capacity?.notes || v.capabilities?.notes) && (
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
                                        )}

                                        {v.documents && v.documents.length > 0 && (
                                            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vedlagte Dokumenter</span>
                                                <div className="flex flex-col gap-1.5">
                                                    {v.documents.map((doc, idx) => (
                                                        <a 
                                                            key={idx} 
                                                            href={doc.url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-primary transition-colors border border-slate-200 rounded-md p-2 group"
                                                        >
                                                            <FileText className="h-3.5 w-3.5 text-slate-400 group-hover:text-primary shrink-0" />
                                                            <span className="truncate">{doc.name}</span>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}`;

content = content.replace(targetDocsBottom, newDocsBottom);
fs.writeFileSync(file, content);
