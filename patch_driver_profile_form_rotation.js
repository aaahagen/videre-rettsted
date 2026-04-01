const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/workforce/driver-profile-form.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add new state variables for rotation
const stateStartIdx = content.indexOf('const [scheduleOverrides');
const newStates = `
    const [useRotation, setUseRotation] = useState<boolean>(!!user.rotation);
    const [rotationStartDate, setRotationStartDate] = useState<Date | undefined>(user.rotation?.rotation?.startDate ? new Date(user.rotation.rotation.startDate) : undefined);
    
    // Helper to generate a default week
    const defaultWeek = () => ({
        days: {
            monday: { isWorking: true, start: '08:00', end: '16:00' },
            tuesday: { isWorking: true, start: '08:00', end: '16:00' },
            wednesday: { isWorking: true, start: '08:00', end: '16:00' },
            thursday: { isWorking: true, start: '08:00', end: '16:00' },
            friday: { isWorking: true, start: '08:00', end: '16:00' },
            saturday: { isWorking: false },
            sunday: { isWorking: false }
        }
    });

    const [rotationWeeks, setRotationWeeks] = useState<any[]>(
        user.rotation?.weeks || [defaultWeek()]
    );

    const addRotationWeek = () => {
        setRotationWeeks([...rotationWeeks, defaultWeek()]);
    };

    const removeRotationWeek = (index: number) => {
        setRotationWeeks(rotationWeeks.filter((_, i) => i !== index));
    };

    const updateRotationDay = (weekIndex: number, day: string, field: string, value: any) => {
        const newWeeks = [...rotationWeeks];
        newWeeks[weekIndex] = {
            ...newWeeks[weekIndex],
            days: {
                ...newWeeks[weekIndex].days,
                [day]: {
                    ...newWeeks[weekIndex].days[day],
                    [field]: value
                }
            }
        };
        setRotationWeeks(newWeeks);
    };
`;

content = content.slice(0, stateStartIdx) + newStates + '\n' + content.slice(stateStartIdx);

// 2. Add rotation to handleSubmit
content = content.replace(
    /scheduleOverrides,/,
    `scheduleOverrides,
                rotation: useRotation && rotationStartDate ? {
                    startDate: rotationStartDate.toISOString(),
                    weeks: rotationWeeks
                } : undefined,`
);

// 3. Add Switch to imports if not there
if (!content.includes('Switch } from')) {
     content = content.replace("import { Label } from '@/components/ui/label';", "import { Label } from '@/components/ui/label';\nimport { Switch } from '@/components/ui/switch';");
}

// 4. Create the Rotation UI string
const rotationUI = `
            <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Turnusplan (Rotasjon)</h3>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="useRotation" className="text-sm">Bruk turnus</Label>
                        <Switch id="useRotation" checked={useRotation} onCheckedChange={setUseRotation} />
                    </div>
                </div>

                {useRotation && (
                    <div className="space-y-6 bg-slate-50 p-4 rounded-lg border">
                        <div className="space-y-2 max-w-xs">
                            <Label>Startdato for turnus</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !rotationStartDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {rotationStartDate ? format(rotationStartDate, "PPP", { locale: nb }) : <span>Velg startdato</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={rotationStartDate}
                                        onSelect={setRotationStartDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <p className="text-xs text-muted-foreground">Denne datoen markerer uke 1 i rotasjonen.</p>
                        </div>

                        <div className="space-y-4">
                            {rotationWeeks.map((week, weekIndex) => (
                                <div key={weekIndex} className="bg-white border rounded-lg p-4 space-y-3">
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <h4 className="font-semibold text-primary">Uke {weekIndex + 1}</h4>
                                        {rotationWeeks.length > 1 && (
                                            <Button variant="ghost" size="sm" type="button" onClick={() => removeRotationWeek(weekIndex)} className="text-destructive h-8 px-2">
                                                Fjern uke
                                            </Button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-2">
                                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((dayKey) => {
                                            const dayData = week.days[dayKey];
                                            const dayNames: Record<string, string> = { monday: 'Man', tuesday: 'Tir', wednesday: 'Ons', thursday: 'Tor', friday: 'Fre', saturday: 'Lør', sunday: 'Søn' };
                                            
                                            return (
                                                <div key={dayKey} className={\`border rounded p-2 flex flex-col gap-2 \${dayData.isWorking ? 'bg-blue-50/50 border-blue-200' : 'bg-slate-50'}\`}>
                                                    <div className="flex items-center justify-between">
                                                        <Label className="text-xs font-bold uppercase">{dayNames[dayKey]}</Label>
                                                        <Switch 
                                                            checked={dayData.isWorking} 
                                                            onCheckedChange={(v) => updateRotationDay(weekIndex, dayKey, 'isWorking', v)} 
                                                            className="scale-75 origin-right"
                                                        />
                                                    </div>
                                                    {dayData.isWorking ? (
                                                        <div className="flex flex-col gap-1 mt-1">
                                                            <Input 
                                                                type="time" 
                                                                value={dayData.start || ''} 
                                                                onChange={(e) => updateRotationDay(weekIndex, dayKey, 'start', e.target.value)} 
                                                                className="h-7 text-xs px-2"
                                                            />
                                                            <Input 
                                                                type="time" 
                                                                value={dayData.end || ''} 
                                                                onChange={(e) => updateRotationDay(weekIndex, dayKey, 'end', e.target.value)} 
                                                                className="h-7 text-xs px-2"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="h-14 flex items-center justify-center text-xs text-muted-foreground italic">
                                                            Fridag
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button type="button" variant="outline" onClick={addRotationWeek} className="w-full border-dashed">
                            <Plus className="mr-2 h-4 w-4" /> Legg til ny uke i rotasjonen
                        </Button>
                    </div>
                )}
            </div>
`;

content = content.replace(
    '<div className="space-y-4 border-t pt-4">\n                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Avvik / Ferie</h3>',
    rotationUI + '\n            <div className="space-y-4 border-t pt-4">\n                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Avvik / Ferie</h3>'
);

// Conditionally render the "Standard Arbeidstid"
content = content.replace(
    '<h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Arbeidstid (Standard)</h3>',
    '{!useRotation && <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Arbeidstid (Standard)</h3>}'
);
content = content.replace(
    '<div className="grid grid-cols-2 gap-4">',
    '{!useRotation && <div className="grid grid-cols-2 gap-4">'
);
content = content.replace(
    /<\/div>\s*<\/div>\s*<\/div>\s*<div className="space-y-4 border-t pt-4">\s*<div className="flex items-center justify-between">/m,
    `                    </div>
                </div>
                }
            </div>
            <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">`
);

fs.writeFileSync(filePath, content);
console.log('Patched DriverProfileForm with Rotation');
