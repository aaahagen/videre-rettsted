const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/workforce/time-stamp-card.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add distance helper
const distanceHelper = `
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // in metres
}
`;

content = content + '\n' + distanceHelper;

// 2. Add Organization state and fetching
content = content.replace(
    'const [activeWorkLog, setActiveWorkLog] = useState<WorkLog | null>(null);',
    `const [activeWorkLog, setActiveWorkLog] = useState<WorkLog | null>(null);
    const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [distanceToDepot, setDistanceToDepot] = useState<number | null>(null);
    const [isOutOfRange, setIsOutOfRange] = useState(false);`
);

// 3. Update useEffect and loading
const oldLoad = `    const loadActiveWorkLog = async () => {
        try {
            setIsLoading(true);
            const logs = await firebaseDB.getWorkLogsForDriver(user.id);
            const active = logs.find(log => log.status === 'active');
            setActiveWorkLog(active || null);
        } catch (error) {
            console.error("Failed to load active work log", error);
        } finally {
            setIsLoading(false);
        }
    };`;

const newLoad = `    const loadData = async () => {
        try {
            setIsLoading(true);
            const [logs, profile, org] = await Promise.all([
                firebaseDB.getWorkLogsForDriver(user.id),
                firebaseDB.getUser(user.id) as Promise<DriverProfile>,
                firebaseDB.getOrganization(user.orgId)
            ]);

            const active = logs.find(log => log.status === 'active');
            setActiveWorkLog(active || null);
            setDriverProfile(profile);
            setOrganization(org);
        } catch (error) {
            console.error("Failed to load operational data", error);
        } finally {
            setIsLoading(false);
        }
    };`;

content = content.replace(oldLoad, newLoad);
content = content.replace('loadActiveWorkLog();', 'loadData();');

// 4. Add logic to check distance on coordinate change
const effectInsertionPoint = '    useEffect(() => {\n        let interval: NodeJS.Timeout;';
const distanceEffect = `    useEffect(() => {
        if (!coordinates || !driverProfile || (!organization?.mainDepot && !driverProfile.baseLocation)) return;

        const target = driverProfile.baseLocation || organization?.mainDepot;
        if (!target?.coordinates) return;

        const dist = calculateDistance(
            coordinates.lat, 
            coordinates.lng, 
            target.coordinates.lat, 
            target.coordinates.lng
        );
        
        setDistanceToDepot(dist);
        
        if (driverProfile.timeTrackingMethod === 'fixed_location' || !driverProfile.timeTrackingMethod) {
            setIsOutOfRange(dist > target.radius);
        } else {
            setIsOutOfRange(false);
        }
    }, [coordinates, driverProfile, organization]);\n\n`;

content = content.replace(effectInsertionPoint, distanceEffect + effectInsertionPoint);

// 5. Update UI for out of range
content = content.replace(
    '<p className="text-xs text-slate-400 max-w-[200px]">Din posisjon og tidspunkt logges når du starter vakten.</p>',
    `<p className="text-xs text-slate-400 max-w-[200px]">
        {isOutOfRange 
            ? \`Du er for langt unna depotet (\${Math.round(distanceToDepot || 0)}m). Gå nærmere for å stemple inn.\`
            : 'Din posisjon og tidspunkt logges når du starter vakten.'}
    </p>`
);

content = content.replace(
    'onClick={handleStartShift}',
    'onClick={handleStartShift}\n                                disabled={isProcessing || isOutOfRange}'
);

// Add missing types to imports
content = content.replace("WorkLog, User", "WorkLog, User, DriverProfile, Organization");

fs.writeFileSync(filePath, content);
console.log('Updated TimeStampCard with Geofencing logic');
