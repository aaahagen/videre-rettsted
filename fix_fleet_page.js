const fs = require('fs');
const file = 'src/app/dashboard/fleet/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetImport = `import { Loader2, Plus, Search, Truck, Edit, Trash2, Camera, Car, Fuel, Weight, Check, X, Building, AlertCircle, FileText } from 'lucide-react';`;
const newImport = `import { Loader2, Plus, Search, Truck, Edit, Trash2, Camera, Car, Fuel, Weight, Check, X, Building, AlertCircle, FileText, Scaling } from 'lucide-react';`;

content = content.replace(targetImport, newImport);

const targetCapabilities = `                                        <div className="flex flex-wrap gap-2 text-xs">
                                            {v.capabilities?.tailLift && <Badge variant="secondary">Lift</Badge>}
                                            {v.capabilities?.refrigeration && <Badge variant="secondary">Kjøl/Frys</Badge>}
                                            {v.capabilities?.trailerCoupling && <Badge variant="secondary">Hengerfeste</Badge>}
                                            {v.capabilities?.adr && <Badge variant="destructive" className="bg-amber-100 text-amber-800 border-amber-200">ADR</Badge>}
                                        </div>`;

const newCapabilities = `                                        <div className="flex flex-wrap gap-2 text-xs">
                                            {v.capabilities?.tailLift && <Badge variant="secondary">Lift</Badge>}
                                            {v.capabilities?.refrigeration && <Badge variant="secondary">Kjøl/Frys</Badge>}
                                            {v.capabilities?.trailerCoupling && <Badge variant="secondary">Hengerfeste</Badge>}
                                            {v.capabilities?.adr && <Badge variant="destructive" className="bg-amber-100 text-amber-800 border-amber-200">ADR</Badge>}
                                        </div>
                                        {(v.dimensions?.height || v.dimensions?.width || v.dimensions?.length) && (
                                            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                                                <Scaling className="h-3.5 w-3.5 shrink-0" />
                                                {v.dimensions.height && <span title="Høyde">H: {v.dimensions.height}m</span>}
                                                {v.dimensions.width && <span title="Bredde">B: {v.dimensions.width}m</span>}
                                                {v.dimensions.length && <span title="Lengde">L: {v.dimensions.length}m</span>}
                                            </div>
                                        )}`;

content = content.replace(targetCapabilities, newCapabilities);
fs.writeFileSync(file, content);
