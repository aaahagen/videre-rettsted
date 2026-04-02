const fs = require('fs');
const file = 'src/app/dashboard/fleet/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetType = `                                            <span>{v.type === 'truck' ? 'Lastebil' : v.type === 'van' ? 'Varebil' : 'Personbil'}</span>`;
const newType = `                                            <span>{v.type === 'truck' ? 'Lastebil' : v.type === 'van' ? 'Varebil' : v.type === 'trailer' ? 'Henger' : 'Personbil'}</span>`;
content = content.replace(targetType, newType);

const targetCapabilities = `                                            {v.capabilities?.adr && <Badge variant="destructive" className="bg-amber-100 text-amber-800 border-amber-200">ADR</Badge>}
                                        </div>`;
const newCapabilities = `                                            {v.capabilities?.adr && <Badge variant="destructive" className="bg-amber-100 text-amber-800 border-amber-200">ADR</Badge>}
                                            {v.capabilities?.flatbed && <Badge variant="outline" className="bg-slate-100 border-slate-300">Flak/Åpen</Badge>}
                                        </div>`;
content = content.replace(targetCapabilities, newCapabilities);

fs.writeFileSync(file, content);
