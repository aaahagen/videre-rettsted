const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/workforce/driver-profile-form.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// I accidentally deleted most of the HR fields from the "Personalinformasjon" card when I tried to rebuild it.
// I need to put them back.

const oldHRCard = `<Card className="bg-slate-50/50">
                        <CardHeader><CardTitle>Personalinformasjon</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Telefon</Label><Input value={phone} onChange={e => setPhone(e.target.value)} /></div>
                            <div className="space-y-2"><Label>Adresse</Label><Input value={address} onChange={e => setAddress(e.target.value)} /></div>
                            <div className="space-y-2"><Label>Personnummer</Label><Input value={socialSecurityNumber} onChange={e => setSocialSecurityNumber(e.target.value)} /></div>
                            <div className="space-y-2"><Label>Bankkonto</Label><Input value={bankAccountNumber} onChange={e => setBankAccountNumber(e.target.value)} /></div>
                        </CardContent>
                    </Card>`;

const newHRCard = `<Card className="bg-slate-50/50">
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
                        
                                <div className="space-y-2 mt-4">
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
                    </Card>`;

content = content.replace(oldHRCard, newHRCard);
fs.writeFileSync(filePath, content);
console.log('Restored HR fields');
