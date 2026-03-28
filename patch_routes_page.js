const fs = require('fs');

const routeDetailsFile = 'src/app/dashboard/routes/[id]/page.tsx';
let code = fs.readFileSync(routeDetailsFile, 'utf8');

// 1. Add extra states for prepTimeStart, prepTimeEnd, breakTime, fuelServiceTime
const stateDeclarations = `  const [duration, setDuration] = useState('N/A');
  const [prepTimeStart, setPrepTimeStart] = useState<number>(0);
  const [prepTimeEnd, setPrepTimeEnd] = useState<number>(0);
  const [breakTime, setBreakTime] = useState<number>(0);
  const [fuelServiceTime, setFuelServiceTime] = useState<number>(0);
  const [baseDurationSeconds, setBaseDurationSeconds] = useState<number>(0);
`;
code = code.replace(/  const \[duration, setDuration\] = useState\('N\/A'\);/, stateDeclarations);

// 2. Set default values from route data and save base duration
const setInitialData = `            setRoute(routeData);
            setAllPlaces(placesData);
            setPrepTimeStart(routeData?.prepTimeStart || 0);
            setPrepTimeEnd(routeData?.prepTimeEnd || 0);
            setBreakTime(routeData?.breakTime || 0);
            setFuelServiceTime(routeData?.fuelServiceTime || 0);
`;
code = code.replace(/            setRoute\(routeData\);\n            setAllPlaces\(placesData\);/, setInitialData);


// 3. Keep track of pure driving duration and combine with extras
const combineDuration = `          if (data.duration) {
            setBaseDurationSeconds(data.duration);
          } else {
            setBaseDurationSeconds(0);
          }`;
code = code.replace(/          if \(data.duration\) \{\n            const hours = Math.floor\(data.duration \/ 3600\);\n            const minutes = Math.floor\(\(data.duration \% 3600\) \/ 60\);\n            if \(hours \> 0\) \{\n              setDuration\(\`\$\{hours\} t \$\{minutes\} min\`\);\n            \} else \{\n              setDuration\(\`\$\{minutes\} min\`\);\n            \}\n          \} else \{\n            setDuration\('N\/A'\);\n          \}/, combineDuration);


const combineDurationOpt = `      if (data.duration) {
        setBaseDurationSeconds(data.duration);
      } else {
        setBaseDurationSeconds(0);
      }`;
code = code.replace(/      if \(data.duration\) \{\n        const hours = Math.floor\(data.duration \/ 3600\);\n        const minutes = Math.floor\(\(data.duration \% 3600\) \/ 60\);\n        if \(hours \> 0\) \{\n          setDuration\(\`\$\{hours\} t \$\{minutes\} min\`\);\n        \} else \{\n          setDuration\(\`\$\{minutes\} min\`\);\n        \}\n      \}/, combineDurationOpt);

// Add useEffect to calculate total duration when any component changes
const calculateTotalDurationEffect = `
  useEffect(() => {
    if (baseDurationSeconds > 0) {
      const totalSeconds = baseDurationSeconds + (prepTimeStart * 60) + (prepTimeEnd * 60) + (breakTime * 60) + (fuelServiceTime * 60);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      if (hours > 0) {
        setDuration(\`\${hours} t \${minutes} min\`);
      } else {
        setDuration(\`\${minutes} min\`);
      }
    } else {
      setDuration('N/A');
    }
  }, [baseDurationSeconds, prepTimeStart, prepTimeEnd, breakTime, fuelServiceTime]);
`;
code = code.replace(/  const handleAddPlace =/, calculateTotalDurationEffect + '\n  const handleAddPlace =');

// 4. Update handleSave to include extra time fields
const saveCode = `      const updatedRoute = {
        ...route,
        places: routePlaces.map(p => p.id),
        prepTimeStart,
        prepTimeEnd,
        breakTime,
        fuelServiceTime
      };`;
code = code.replace(/      const updatedRoute = \{\n        \.\.\.route,\n        places: routePlaces\.map\(p => p\.id\),\n      \};/, saveCode);

// 5. Add UI for extra fields

const timeSettingsUI = `
      {/* Time Settings Box */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
             <Clock className="h-5 w-5 text-slate-500" />
             Tidsinnstillinger
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Klargjøring (start)</label>
              <Select 
                value={prepTimeStart.toString()} 
                onValueChange={(val) => setPrepTimeStart(Number(val))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Velg tid" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 min</SelectItem>
                  <SelectItem value="5">5 min</SelectItem>
                  <SelectItem value="10">10 min</SelectItem>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="20">20 min</SelectItem>
                  <SelectItem value="25">25 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ferdigstilling (slutt)</label>
              <Select 
                value={prepTimeEnd.toString()} 
                onValueChange={(val) => setPrepTimeEnd(Number(val))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Velg tid" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 min</SelectItem>
                  <SelectItem value="5">5 min</SelectItem>
                  <SelectItem value="10">10 min</SelectItem>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="20">20 min</SelectItem>
                  <SelectItem value="25">25 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Pause</label>
              <Select 
                value={breakTime.toString()} 
                onValueChange={(val) => setBreakTime(Number(val))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Velg tid" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 min</SelectItem>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="60">60 min</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Drivstoff / Service</label>
              <Select 
                value={fuelServiceTime.toString()} 
                onValueChange={(val) => setFuelServiceTime(Number(val))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Velg tid" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 min</SelectItem>
                  <SelectItem value="5">5 min</SelectItem>
                  <SelectItem value="10">10 min</SelectItem>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="20">20 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
`;

code = code.replace(/      \{\/\* Middle Box: Driver Assignment \*\/\}/, timeSettingsUI + "\n      {/* Middle Box: Driver Assignment */}");

fs.writeFileSync(routeDetailsFile, code);

