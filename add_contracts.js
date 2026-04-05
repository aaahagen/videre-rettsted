const fs = require('fs');
const path = require('path');

const formPath = path.join(__dirname, 'src/components/workforce/driver-profile-form.tsx');
let content = fs.readFileSync(formPath, 'utf8');

// 1. Add state variables for the new fields
const stateSearch = `const [seniorityDate, setSeniorityDate] = useState(user.seniorityDate || '');`;
const stateReplacement = `const [seniorityDate, setSeniorityDate] = useState(user.seniorityDate || '');
    
    // Contract fields
    const [contracts, setContracts] = useState<DriverProfile['contracts']>(user.contracts || []);
    const [newContractStart, setNewContractStart] = useState('');
    const [newContractEnd, setNewContractEnd] = useState('');
    const [newContractHours, setNewContractHours] = useState('');
    const [newContractRole, setNewContractRole] = useState('Sjåfør');`;

content = content.replace(stateSearch, stateReplacement);

// 2. Add them to dataToSubmit
const submitSearch = `seniorityDate,`;
const submitReplacement = `seniorityDate,
                contracts,`;

content = content.replace(submitSearch, submitReplacement);

const functionsSearch = `const addSkill = () => {`;
const functionsReplacement = `
    const addContract = () => {
        if (!newContractStart || !newContractHours) return;
        const newContract = {
            id: uuidv4(),
            startDate: newContractStart,
            endDate: newContractEnd || undefined,
            contractedHours: Number(newContractHours),
            role: newContractRole
        };
        setContracts([...contracts, newContract]);
        setNewContractStart('');
        setNewContractEnd('');
        setNewContractHours('');
        setNewContractRole('Sjåfør');
    };

    const removeContract = (id: string) => {
        setContracts(contracts.filter(c => c.id !== id));
    };

    const addSkill = () => {`;
content = content.replace(functionsSearch, functionsReplacement);

// 3. Add the new card to the UI
const uiSearch = `<div className="w-full lg:w-2/3 space-y-6">`;
const uiReplacement = `<div className="w-full lg:w-2/3 space-y-6">
                    <Card className="bg-slate-50/50">
                        <CardHeader>
                            <CardTitle>Arbeidskontrakter</CardTitle>
                            <CardDescription>Oversikt over nåværende og tidligere kontrakter.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-end">
                                <div className="space-y-2">
                                    <Label>Fra dato</Label>
                                    <Input type="date" value={newContractStart} onChange={e => setNewContractStart(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Til dato (valgfri)</Label>
                                    <Input type="date" value={newContractEnd} onChange={e => setNewContractEnd(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Timer/uke</Label>
                                    <Input type="number" value={newContractHours} onChange={e => setNewContractHours(e.target.value)} placeholder="F.eks 37.5" />
                                </div>
                                <Button type="button" variant="secondary" onClick={addContract} disabled={!newContractStart || !newContractHours} className="w-full"><Plus className="h-4 w-4 mr-2" /> Legg til</Button>
                            </div>

                            {contracts.length > 0 && (
                                <div className="space-y-2 pt-4 border-t">
                                    {contracts.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).map(contract => (
                                        <div key={contract.id} className="flex justify-between items-center p-3 border rounded-lg bg-white shadow-sm">
                                            <div className="grid grid-cols-3 gap-4 flex-1">
                                                <div>
                                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Periode</p>
                                                    <p className="text-sm font-medium">{format(new Date(contract.startDate), 'dd.MM.yyyy')} - {contract.endDate ? format(new Date(contract.endDate), 'dd.MM.yyyy') : 'Pågående'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Stilling</p>
                                                    <p className="text-sm font-medium">{contract.role}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Timer/uke</p>
                                                    <p className="text-sm font-medium">{contract.contractedHours} t</p>
                                                </div>
                                            </div>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeContract(contract.id)} className="text-destructive hover:bg-destructive/10 ml-4 shrink-0">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
`;

content = content.replace(uiSearch, uiReplacement);

fs.writeFileSync(formPath, content);
console.log("Updated driver profile form with contracts");
