const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/workforce/page.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// The layout redirect logic needs to know we are on workforce page so we don't redirect to dashboard

// Fix the card header layout to just have the date picker since we removed the search bar
const oldCardHeader = `<CardHeader className="pb-3 border-b">
                        <div className="flex flex-col sm:flex-row gap-4 items-end">
                            
                            <div className="space-y-2 w-full sm:w-auto">
                                <Label>Velg dato for oversikt</Label>
                                <Input 
                                    type="date"
                                    value={searchDateStr}
                                    onChange={(e) => setSearchDateStr(e.target.value)}
                                    className="w-full sm:w-[240px]"
                                />
                            </div>
                        </div>
                    </CardHeader>`;

const newCardHeader = `<CardHeader className="pb-3 border-b">
                        <div className="flex flex-col sm:flex-row gap-4 items-end justify-between">
                            <div className="space-y-2 w-full sm:w-auto">
                                <Label>Velg dato for oversikt</Label>
                                <Input 
                                    type="date"
                                    value={searchDateStr}
                                    onChange={(e) => setSearchDateStr(e.target.value)}
                                    className="w-full sm:w-[240px]"
                                />
                            </div>
                        </div>
                    </CardHeader>`;

code = code.replace(oldCardHeader, newCardHeader);

fs.writeFileSync(filePath, code);
