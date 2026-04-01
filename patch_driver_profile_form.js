const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/workforce/driver-profile-form.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const newImports = `import { useState } from 'react';
import { DriverProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, X, Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { cn } from '@/lib/utils';
`;

// Replace imports
content = content.replace(/import \{ useState \} from 'react';[\s\S]*?import \{ Loader2, Plus, X \} from 'lucide-react';/, newImports);

// Find the component start
const componentStartIdx = content.indexOf('export function DriverProfileForm');
const stateStartIdx = content.indexOf('const [isSubmitting, setIsSubmitting]', componentStartIdx);

// Add state for schedule overrides
const newStates = `
    const [scheduleOverrides, setScheduleOverrides] = useState<DriverProfile['scheduleOverrides']>(user.scheduleOverrides || {});
    
    // UI state for adding new override
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [overrideType, setOverrideType] = useState<'off' | 'vacation' | 'sick' | 'custom'>('off');
    const [overrideStart, setOverrideStart] = useState('08:00');
    const [overrideEnd, setOverrideEnd] = useState('16:00');

    const addOverride = () => {
        if (!selectedDate) return;
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        setScheduleOverrides(prev => ({
            ...prev,
            [dateStr]: {
                type: overrideType,
                ...(overrideType === 'custom' ? { start: overrideStart, end: overrideEnd } : {})
            }
        }));
        setSelectedDate(undefined);
    };

    const removeOverride = (dateStr: string) => {
        setScheduleOverrides(prev => {
            if (!prev) return prev;
            const updated = { ...prev };
            delete updated[dateStr];
            return updated;
        });
    };
`;

content = content.slice(0, stateStartIdx) + 
          'const [isSubmitting, setIsSubmitting] = useState(false);\n' + 
          newStates + 
          content.slice(content.indexOf('const [workingHoursStart'));


// Update handleSubmit to include scheduleOverrides
content = content.replace(
    /workingHours: \{\s*start: workingHoursStart,\s*end: workingHoursEnd\s*\},/,
    `workingHours: {
                    start: workingHoursStart,
                    end: workingHoursEnd
                },
                scheduleOverrides,`
);

// Define the UI for the schedule overrides
const scheduleOverridesUI = `
            <div className="space-y-4 border-t pt-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Avvik / Ferie</h3>
                
                <div className="flex flex-col sm:flex-row gap-3 items-end bg-slate-50 p-4 rounded-lg border">
                    <div className="space-y-2 w-full sm:w-auto">
                        <Label>Dato</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-[180px] justify-start text-left font-normal",
                                        !selectedDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {selectedDate ? format(selectedDate, "PPP", { locale: nb }) : <span>Velg dato</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    
                    <div className="space-y-2 w-full sm:w-auto">
                        <Label>Type</Label>
                        <Select value={overrideType} onValueChange={(v: any) => setOverrideType(v)}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="off">Fridag</SelectItem>
                                <SelectItem value="vacation">Ferie</SelectItem>
                                <SelectItem value="sick">Sykemelding</SelectItem>
                                <SelectItem value="custom">Tilpasset tid</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {overrideType === 'custom' && (
                        <>
                            <div className="space-y-2 w-full sm:w-auto">
                                <Label>Start</Label>
                                <Input type="time" value={overrideStart} onChange={e => setOverrideStart(e.target.value)} className="w-[100px]"/>
                            </div>
                            <div className="space-y-2 w-full sm:w-auto">
                                <Label>Slutt</Label>
                                <Input type="time" value={overrideEnd} onChange={e => setOverrideEnd(e.target.value)} className="w-[100px]"/>
                            </div>
                        </>
                    )}

                    <Button type="button" onClick={addOverride} disabled={!selectedDate} className="w-full sm:w-auto">
                        Legg til
                    </Button>
                </div>

                {scheduleOverrides && Object.keys(scheduleOverrides).length > 0 && (
                    <div className="space-y-2 mt-4">
                        {Object.entries(scheduleOverrides).sort(([a], [b]) => a.localeCompare(b)).map(([date, details]) => {
                            let typeLabel = '';
                            let colorClass = '';
                            switch(details.type) {
                                case 'off': typeLabel = 'Fridag'; colorClass = 'bg-slate-100 text-slate-700'; break;
                                case 'vacation': typeLabel = 'Ferie'; colorClass = 'bg-green-100 text-green-700 border-green-200'; break;
                                case 'sick': typeLabel = 'Syk'; colorClass = 'bg-red-100 text-red-700 border-red-200'; break;
                                case 'custom': typeLabel = \`Arbeider \${details.start} - \${details.end}\`; colorClass = 'bg-blue-100 text-blue-700 border-blue-200'; break;
                            }
                            return (
                                <div key={date} className="flex justify-between items-center p-2 border rounded bg-white">
                                    <div className="flex items-center gap-4">
                                        <span className="font-medium w-24">{format(new Date(date), 'dd.MM.yyyy')}</span>
                                        <span className={\`px-2 py-0.5 rounded text-sm border \${colorClass}\`}>
                                            {typeLabel}
                                        </span>
                                    </div>
                                    <Button variant="ghost" size="sm" type="button" onClick={() => removeOverride(date)} className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive">
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
`;

// Insert the new UI before the Certifications section
content = content.replace(
    '<div className="space-y-4 border-t pt-4">\n                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Sertifiseringer</h3>',
    scheduleOverridesUI + '\n            <div className="space-y-4 border-t pt-4">\n                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Sertifiseringer</h3>'
);

fs.writeFileSync(filePath, content);
console.log('Patched DriverProfileForm');
