const fs = require('fs');
const path = require('path');

const formPath = path.join(__dirname, 'src/components/workforce/driver-profile-form.tsx');
let content = fs.readFileSync(formPath, 'utf8');

// I accidentally duplicated the start of the card when replacing.
const search = `                    <Card className="bg-slate-50/50">
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
                        </CardHeader>
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

const replace = `                    <Card className="bg-slate-50/50">
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

content = content.replace(search, replace);
fs.writeFileSync(formPath, content);
console.log("Fixed HR duplicated header");
