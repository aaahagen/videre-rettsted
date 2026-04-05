const fs = require('fs');
const path = require('path');

const formPath = path.join(__dirname, 'src/components/workforce/driver-profile-form.tsx');
let content = fs.readFileSync(formPath, 'utf8');

// 1. Add state variables for the new fields
const stateSearch = `const [agencyEmail, setAgencyEmail] = useState(user?.agencyInfo?.email || '');`;
const stateReplacement = `const [agencyEmail, setAgencyEmail] = useState(user?.agencyInfo?.email || '');
    
    // Core HR fields
    const [phone, setPhone] = useState(user.phone || '');
    const [address, setAddress] = useState(user.address || '');
    const [emergencyContact, setEmergencyContact] = useState(user.emergencyContact || '');
    const [nextOfKin, setNextOfKin] = useState(user.nextOfKin || '');
    const [children, setChildren] = useState(user.children || '');
    const [adminNotes, setAdminNotes] = useState(user.adminNotes || '');
    const [seniorityDate, setSeniorityDate] = useState(user.seniorityDate || '');`;

content = content.replace(stateSearch, stateReplacement);

// 2. Add them to dataToSubmit
const submitSearch = `role: employmentType === 'external' ? 'contractor' : 'driver',`;
const submitReplacement = `role: employmentType === 'external' ? 'contractor' : 'driver',
                phone,
                address,
                emergencyContact,
                nextOfKin,
                children,
                adminNotes,
                seniorityDate,`;

content = content.replace(submitSearch, submitReplacement);

// 3. Add the new card to the UI
const uiSearch = `<div className="w-full lg:w-2/3 space-y-6">`;
const uiReplacement = `<div className="w-full lg:w-2/3 space-y-6">
                    <Card className="bg-slate-50/50">
                        <CardHeader>
                            <CardTitle>Personalinformasjon</CardTitle>
                            <CardDescription>Grunnleggende informasjon for de ansatte.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Telefonnummer</Label>
                                    <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Tlf nr" type="tel" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Adresse</Label>
                                    <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Full adresse" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Nødkontakt / Pårørende</Label>
                                    <Input value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)} placeholder="Navn og tlf" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Ansatt siden</Label>
                                    <Input type="date" value={seniorityDate} onChange={e => setSeniorityDate(e.target.value)} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
`;

content = content.replace(uiSearch, uiReplacement);

fs.writeFileSync(formPath, content);
console.log("Updated driver profile form");
