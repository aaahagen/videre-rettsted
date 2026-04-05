const fs = require('fs');
const path = require('path');

const formPath = path.join(__dirname, 'src/components/workforce/driver-profile-form.tsx');
let content = fs.readFileSync(formPath, 'utf8');

// 1. Add state variables
const stateSearch = `const [seniorityDate, setSeniorityDate] = useState(user.seniorityDate || '');`;
const stateReplacement = `const [seniorityDate, setSeniorityDate] = useState(user.seniorityDate || '');
    
    // Extended HR fields
    const [dateOfBirth, setDateOfBirth] = useState(user.dateOfBirth || '');
    const [socialSecurityNumber, setSocialSecurityNumber] = useState(user.socialSecurityNumber || '');
    const [gender, setGender] = useState(user.gender || '');
    const [employeeId, setEmployeeId] = useState(user.employeeId || '');
    const [jobTitle, setJobTitle] = useState(user.jobTitle || '');
    const [department, setDepartment] = useState(user.department || '');
    const [supervisor, setSupervisor] = useState(user.supervisor || '');
    const [employmentStatus, setEmploymentStatus] = useState(user.employmentStatus || '');
    const [probationEndDate, setProbationEndDate] = useState(user.probationEndDate || '');
    const [hourlyRate, setHourlyRate] = useState(user.hourlyRate || '');
    const [bankAccountNumber, setBankAccountNumber] = useState(user.bankAccountNumber || '');
    const [taxCode, setTaxCode] = useState(user.taxCode || '');
    const [staffHandbookAcknowledged, setStaffHandbookAcknowledged] = useState(user.staffHandbookAcknowledged || false);
    const [backgroundCheckDate, setBackgroundCheckDate] = useState(user.backgroundCheckDate || '');`;

content = content.replace(stateSearch, stateReplacement);

// 2. Add them to dataToSubmit
const submitSearch = `seniorityDate,`;
const submitReplacement = `seniorityDate,
                dateOfBirth,
                socialSecurityNumber,
                gender,
                employeeId,
                jobTitle,
                department,
                supervisor,
                employmentStatus,
                probationEndDate,
                hourlyRate: hourlyRate ? Number(hourlyRate) : undefined,
                bankAccountNumber,
                taxCode,
                staffHandbookAcknowledged,
                backgroundCheckDate,`;

content = content.replace(submitSearch, submitReplacement);

// 3. Add the UI fields to the existing card
const uiSearch = `</CardContent>
                    </Card>

                    <Card className="bg-slate-50/50">
                        <CardHeader>
                            <div className="flex items-start justify-between">`;
const uiReplacement = `
                                <div className="space-y-2">
                                    <Label>Fødselsdato</Label>
                                    <Input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Personnummer / D-nummer</Label>
                                    <Input value={socialSecurityNumber} onChange={e => setSocialSecurityNumber(e.target.value)} placeholder="11 siffer" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Kjønn</Label>
                                    <Select value={gender} onValueChange={setGender}>
                                        <SelectTrigger><SelectValue placeholder="Velg kjønn" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Mann</SelectItem>
                                            <SelectItem value="female">Kvinne</SelectItem>
                                            <SelectItem value="other">Annet</SelectItem>
                                            <SelectItem value="prefer_not_to_say">Ønsker ikke å oppgi</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Ansattnummer</Label>
                                    <Input value={employeeId} onChange={e => setEmployeeId(e.target.value)} placeholder="F.eks. 1001" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Stillingstittel</Label>
                                    <Input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="Sjåfør" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Avdeling</Label>
                                    <Input value={department} onChange={e => setDepartment(e.target.value)} placeholder="Transport" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Nærmeste leder</Label>
                                    <Input value={supervisor} onChange={e => setSupervisor(e.target.value)} placeholder="Navn på leder" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Stillingsprosent / Status</Label>
                                    <Select value={employmentStatus} onValueChange={setEmploymentStatus}>
                                        <SelectTrigger><SelectValue placeholder="Velg status" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="full-time">Heltid (100%)</SelectItem>
                                            <SelectItem value="part-time">Deltid</SelectItem>
                                            <SelectItem value="temporary">Midlertidig</SelectItem>
                                            <SelectItem value="on-call">Tilkalling / Ringevikar</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Prøvetid utløper</Label>
                                    <Input type="date" value={probationEndDate} onChange={e => setProbationEndDate(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Timelønn / Lønn</Label>
                                    <Input type="number" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} placeholder="NOK" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Bankkontonummer</Label>
                                    <Input value={bankAccountNumber} onChange={e => setBankAccountNumber(e.target.value)} placeholder="11 siffer" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Skattekort / Tabell</Label>
                                    <Input value={taxCode} onChange={e => setTaxCode(e.target.value)} placeholder="F.eks. 7100" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Dato for bakgrunnssjekk</Label>
                                    <Input type="date" value={backgroundCheckDate} onChange={e => setBackgroundCheckDate(e.target.value)} />
                                </div>
                                <div className="space-y-2 col-span-1 sm:col-span-2 flex items-center gap-2 pt-2 border-t mt-2">
                                    <Switch checked={staffHandbookAcknowledged} onCheckedChange={setStaffHandbookAcknowledged} id="handbook" />
                                    <Label htmlFor="handbook">Har lest og akseptert personalhåndboken</Label>
                                </div>
                            </div>
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

content = content.replace(uiSearch, uiReplacement);

fs.writeFileSync(formPath, content);
console.log('Updated driver-profile-form.tsx with extended HR fields');
