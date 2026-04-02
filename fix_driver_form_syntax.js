const fs = require('fs');
const path = require('path');

let formPath = path.join(__dirname, 'src/components/workforce/driver-profile-form.tsx');
let formCode = fs.readFileSync(formPath, 'utf8');

// I can see the error from the file content.
// There is a missing `</div>` tag before the `</CardContent>`.
// And missing imports and state definitions from when I added the contractor feature.

// 1. Add missing imports
if (!formCode.includes('Briefcase')) {
    formCode = formCode.replace(
        "import { Loader2, Plus, X, UploadCloud, Trash2, FileText, Download, User as UserIcon } from 'lucide-react';",
        "import { Loader2, Plus, X, UploadCloud, Trash2, FileText, Download, User as UserIcon, Briefcase } from 'lucide-react';"
    );
}

// 2. Add missing state
if (!formCode.includes('employmentType')) {
    const stateToReplace = "const [newSkill, setNewSkill] = useState('');";
    const newState = `const [newSkill, setNewSkill] = useState('');
    const [employmentType, setEmploymentType] = useState<'internal' | 'external'>(user?.employmentType || 'internal');
    const [agencyName, setAgencyName] = useState(user?.agencyInfo?.name || '');
    const [agencyContact, setAgencyContact] = useState(user?.agencyInfo?.contactPerson || '');
    const [agencyPhone, setAgencyPhone] = useState(user?.agencyInfo?.phone || '');
    const [agencyEmail, setAgencyEmail] = useState(user?.agencyInfo?.email || '');`;
    formCode = formCode.replace(stateToReplace, stateToReplace + '\n' + newState);
}

// 3. Fix missing closing div
const brokenPart = `                                <div className="flex flex-wrap gap-2 pt-2">
                                    {skills.map((skill, i) => (<div key={i} className="flex items-center gap-1 bg-slate-200 text-slate-800 px-3 py-1 rounded-full text-sm font-medium border border-slate-300"> {skill} <button type="button" onClick={() => removeSkill(skill)} className="hover:text-slate-900 ml-1"><X className="h-3 w-3" /></button></div>))}
                                </div>
                            
                            <div className="space-y-2 col-span-2 pt-2 border-t">`;

const fixedPart = `                                <div className="flex flex-wrap gap-2 pt-2">
                                    {skills.map((skill, i) => (<div key={i} className="flex items-center gap-1 bg-slate-200 text-slate-800 px-3 py-1 rounded-full text-sm font-medium border border-slate-300"> {skill} <button type="button" onClick={() => removeSkill(skill)} className="hover:text-slate-900 ml-1"><X className="h-3 w-3" /></button></div>))}
                                </div>
                            </div>
                            <div className="space-y-2 col-span-2 pt-2 border-t">`;

formCode = formCode.replace(brokenPart, fixedPart);

// 4. Also need to fix the submit handler
const oldSubmitData = 'const dataToSubmit: any = {';

if (!formCode.includes('employmentType,')) {
    const submitToReplace = `const dataToSubmit: any = {
                certifications,
                skills,
                scheduleOverrides,
                images: imageData,
                documents: uploadedDocuments,
            };`;

    const newSubmitData = `const dataToSubmit: any = {
                certifications,
                skills,
                scheduleOverrides,
                images: imageData,
                documents: uploadedDocuments,
                employmentType,
                role: employmentType === 'external' ? 'contractor' : 'driver',
            };

            if (employmentType === 'external') {
                dataToSubmit.agencyInfo = {
                    name: agencyName,
                    contactPerson: agencyContact,
                    phone: agencyPhone,
                    email: agencyEmail,
                };
            } else {
                dataToSubmit.agencyInfo = deleteField();
            }`;
    formCode = formCode.replace(submitToReplace, newSubmitData);
}


fs.writeFileSync(formPath, formCode);
