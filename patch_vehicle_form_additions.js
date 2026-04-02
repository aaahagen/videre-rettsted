const fs = require('fs');
const file = 'src/components/fleet/vehicle-form.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetType = `                                <SelectContent>
                                    <SelectItem value="car">Personbil</SelectItem>
                                    <SelectItem value="van">Varebil</SelectItem>
                                    <SelectItem value="truck">Lastebil</SelectItem>
                                </SelectContent>`;

const newType = `                                <SelectContent>
                                    <SelectItem value="car">Personbil</SelectItem>
                                    <SelectItem value="van">Varebil</SelectItem>
                                    <SelectItem value="truck">Lastebil</SelectItem>
                                    <SelectItem value="trailer">Henger</SelectItem>
                                </SelectContent>`;
content = content.replace(targetType, newType);

const targetCapabilities = `                        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors shadow-sm">
                            <Label className="flex-1 cursor-pointer font-semibold text-slate-700" htmlFor="adr">ADR (Farlig gods)</Label>
                            <Switch id="adr" checked={formData.capabilities?.adr} onCheckedChange={v => handleNestedChange('capabilities', 'adr', v)} />
                        </div>
                    </div>`;

const newCapabilities = `                        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors shadow-sm">
                            <Label className="flex-1 cursor-pointer font-semibold text-slate-700" htmlFor="adr">ADR (Farlig gods)</Label>
                            <Switch id="adr" checked={formData.capabilities?.adr} onCheckedChange={v => handleNestedChange('capabilities', 'adr', v)} />
                        </div>
                        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors shadow-sm">
                            <Label className="flex-1 cursor-pointer font-semibold text-slate-700" htmlFor="flatbed">Flakbil / Åpen Henger</Label>
                            <Switch id="flatbed" checked={formData.capabilities?.flatbed} onCheckedChange={v => handleNestedChange('capabilities', 'flatbed', v)} />
                        </div>
                    </div>`;
content = content.replace(targetCapabilities, newCapabilities);

fs.writeFileSync(file, content);
