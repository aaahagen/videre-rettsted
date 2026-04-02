const fs = require('fs');
const path = require('path');

let formPath = path.join(__dirname, 'src/components/workforce/driver-profile-form.tsx');
let formCode = fs.readFileSync(formPath, 'utf8');

// Add inputs for employment type and agency info
const importToReplace = "import { User, CalendarDays, Clock, FileText, Check, Plus, Trash2, Calendar as CalendarIcon, Save } from 'lucide-react';";
const newImport = "import { User, CalendarDays, Clock, FileText, Check, Plus, Trash2, Calendar as CalendarIcon, Save, Briefcase } from 'lucide-react';";
formCode = formCode.replace(importToReplace, newImport);

const stateToReplace = "const [skills, setSkills] = useState<string[]>(user?.skills || []);";
const newState = `const [skills, setSkills] = useState<string[]>(user?.skills || []);
    const [employmentType, setEmploymentType] = useState<'internal' | 'external'>(user?.employmentType || 'internal');
    const [agencyName, setAgencyName] = useState(user?.agencyInfo?.name || '');
    const [agencyContact, setAgencyContact] = useState(user?.agencyInfo?.contactPerson || '');
    const [agencyPhone, setAgencyPhone] = useState(user?.agencyInfo?.phone || '');
    const [agencyEmail, setAgencyEmail] = useState(user?.agencyInfo?.email || '');`;
formCode = formCode.replace(stateToReplace, newState);

// Update data to submit
const submitToReplace = `const data: Partial<DriverProfile> = {
            workingHours,
            rotation: localRotation,
            scheduleOverrides: currentOverrides,
            certifications,
            skills,
        };`;
const newSubmit = `const data: Partial<DriverProfile> = {
            workingHours,
            rotation: localRotation,
            scheduleOverrides: currentOverrides,
            certifications,
            skills,
            employmentType,
            role: employmentType === 'external' ? 'contractor' : 'driver',
        };

        if (employmentType === 'external') {
            data.agencyInfo = {
                name: agencyName,
                contactPerson: agencyContact,
                phone: agencyPhone,
                email: agencyEmail,
            };
        } else {
            data.agencyInfo = null as any; // clear it
        }`;
formCode = formCode.replace(submitToReplace, newSubmit);

// Add UI elements for agency info inside the Basic Info tab
const basicInfoContentEnd = `</div>
                        </CardContent>
                    </Card>`;

const agencyUI = `
                        {employmentType === 'external' && (
                            <div className="pt-4 border-t space-y-4">
                                <h3 className="font-semibold text-sm flex items-center gap-2"><Briefcase className="h-4 w-4" /> Bemanningsbyrå Info</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Byrånavn</Label>
                                        <Input value={agencyName} onChange={e => setAgencyName(e.target.value)} placeholder="F.eks. Adecco, Manpower" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Kontaktperson</Label>
                                        <Input value={agencyContact} onChange={e => setAgencyContact(e.target.value)} placeholder="Navn på kontaktperson" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Telefon</Label>
                                        <Input value={agencyPhone} onChange={e => setAgencyPhone(e.target.value)} placeholder="Tlf nr" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>E-post</Label>
                                        <Input value={agencyEmail} onChange={e => setAgencyEmail(e.target.value)} placeholder="E-postadresse" type="email" />
                                    </div>
                                </div>
                            </div>
                        )}
`;

const basicInfoContentUpdate = `
                            <div className="space-y-2 col-span-2 pt-2 border-t">
                                <Label>Ansettelsestype</Label>
                                <div className="flex flex-col sm:flex-row gap-4 mt-2">
                                    <label className="flex items-center space-x-2 cursor-pointer border p-3 rounded-lg flex-1 hover:bg-slate-50 transition-colors">
                                        <input 
                                            type="radio" 
                                            name="employmentType" 
                                            value="internal" 
                                            checked={employmentType === 'internal'} 
                                            onChange={() => setEmploymentType('internal')}
                                            className="w-4 h-4 text-primary"
                                        />
                                        <span>Fast ansatt (Intern)</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer border p-3 rounded-lg flex-1 hover:bg-slate-50 transition-colors">
                                        <input 
                                            type="radio" 
                                            name="employmentType" 
                                            value="external" 
                                            checked={employmentType === 'external'} 
                                            onChange={() => setEmploymentType('external')}
                                            className="w-4 h-4 text-primary"
                                        />
                                        <span>Innleid (Ekstern)</span>
                                    </label>
                                </div>
                            </div>
                        ${agencyUI}
                        </div>
                        </CardContent>
                    </Card>`;

formCode = formCode.replace(basicInfoContentEnd, basicInfoContentUpdate);

fs.writeFileSync(formPath, formCode);
