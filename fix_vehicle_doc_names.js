const fs = require('fs');
const file = 'src/components/fleet/vehicle-form.tsx';
let content = fs.readFileSync(file, 'utf8');

// I need to add a "Name" input for each document
const targetDocUpdate = `    const handleUpdateCustomField = (index: number, field: 'name' | 'value', value: string) => {`;
const newDocUpdate = `    const handleUpdateDocumentName = (index: number, newName: string) => {
        setDocuments(prev => {
            const next = [...prev];
            next[index] = { ...next[index], name: newName };
            return next;
        });
    };

    const handleUpdateCustomField = (index: number, field: 'name' | 'value', value: string) => {`;
content = content.replace(targetDocUpdate, newDocUpdate);


const targetDocUI = `                    {documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                            <div className="flex items-center gap-3">
                                <FileText className="h-6 w-6 text-slate-500" />
                                <span className="font-medium text-sm truncate">{doc.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {doc.url && (
                                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                        <Button type="button" variant="outline" size="icon" className="h-8 w-8">
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </a>
                                )}
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => removeDocument(index)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}`;

const newDocUI = `                    {documents.map((doc, index) => (
                        <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg bg-white gap-3 shadow-sm">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <FileText className="h-6 w-6 text-slate-400 shrink-0" />
                                <Input 
                                    value={doc.name} 
                                    onChange={(e) => handleUpdateDocumentName(index, e.target.value)} 
                                    placeholder="Filnavn (F.eks. Vognkort)" 
                                    className="h-8 text-sm font-medium bg-slate-50 border-transparent hover:border-slate-200 focus-visible:bg-white flex-1 min-w-0"
                                />
                            </div>
                            <div className="flex items-center justify-end gap-2 shrink-0">
                                {doc.url && (
                                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                        <Button type="button" variant="outline" size="icon" className="h-8 w-8" title="Last ned dokument">
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </a>
                                )}
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-destructive hover:bg-destructive/10" onClick={() => removeDocument(index)} title="Slett dokument">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}`;

content = content.replace(targetDocUI, newDocUI);
fs.writeFileSync(file, content);
