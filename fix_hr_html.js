const fs = require('fs');
const path = require('path');

const formPath = path.join(__dirname, 'src/components/workforce/driver-profile-form.tsx');
let content = fs.readFileSync(formPath, 'utf8');

// Ensure correct closing tags
const search = `                            </div>
                            <div className="space-y-2 mt-4 pt-4 border-t">
                                <Label>Admin Notat (Kun synlig for ledere)</Label>
                                <textarea 
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={adminNotes} 
                                    onChange={e => setAdminNotes(e.target.value)} 
                                    placeholder="Interne notater..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-50/50">
                        <CardHeader>
                            <div className="flex items-start justify-between">`;
const replacement = `                            </div>
                            <div className="space-y-2 mt-4 pt-4 border-t">
                                <Label>Admin Notat (Kun synlig for ledere)</Label>
                                <textarea 
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={adminNotes} 
                                    onChange={e => setAdminNotes(e.target.value)} 
                                    placeholder="Interne notater..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-50/50">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle>Arbeidstid</CardTitle>
                                    <CardDescription>Definer standard arbeidstid eller en rullerende turnusplan.</CardDescription>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 pt-1">
                                    <Label htmlFor="useRotation" className="text-sm font-normal text-muted-foreground">Bruk turnus?</Label>
                                    <Switch id="useRotation" checked={useRotation} onCheckedChange={setUseRotation} />
                                </div>
                            </div>
                        </CardHeader>`;

if (content.includes(search)) {
    content = content.replace(search, replacement);
}

fs.writeFileSync(formPath, content);
console.log("Fixed HR html");
