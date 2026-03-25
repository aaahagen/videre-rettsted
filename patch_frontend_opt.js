const fs = require('fs');
const file = 'src/app/dashboard/routes/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Import Wand2 icon
content = content.replace(
  /import \{ Loader2, Trash2, GripVertical \} from 'lucide-react';/g,
  `import { Loader2, Trash2, GripVertical, Wand2 } from 'lucide-react';`
);

// Add isOptimizing state
content = content.replace(
  /const \[isCalculating, setIsCalculating\] = useState\(false\);/g,
  `const [isCalculating, setIsCalculating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);`
);

// Update debouncedCalculateDistance to NOT update routePlaces
content = content.replace(
  /          const result = await calculateDistanceFn\(\{ placeIds \}\);\n          const data = result\.data as \{ distance: number \};\n          setDistance\(\`\$\{data\.distance\.toFixed\(1\)\} km\`\);/g,
  `          const result = await calculateDistanceFn({ placeIds });
          const data = result.data as { distance: number, waypointOrder: number[] };
          setDistance(\`\${data.distance.toFixed(1)} km\`);`
);

// Add optimize handler
content = content.replace(
  /  const handleSave = async \(\) => \{/g,
  `  const handleOptimizeRoute = async () => {
    if (routePlaces.length <= 2) {
      toast({ title: 'Info', description: 'Du trenger minst 3 stopp for å optimere ruten.' });
      return;
    }
    
    if (routePlaces.length > 27) { // API limit is 25 intermediate + 2 endpoints
        toast({ 
            title: 'For mange stopp', 
            description: 'Google Maps tillater maks 25 mellomstopp for automatisk optimalisering.', 
            variant: 'destructive' 
        });
        return;
    }

    setIsOptimizing(true);
    try {
      const placeIds = routePlaces.map(p => p.id);
      const functions = getFunctions();
      const calculateDistanceFn = httpsCallable(functions, 'calculateRouteDistance');
      const result = await calculateDistanceFn({ placeIds });
      const data = result.data as { distance: number, waypointOrder: number[] };
      
      setDistance(\`\${data.distance.toFixed(1)} km\`);
      
      if (data.waypointOrder && data.waypointOrder.length > 0) {
        // Reconstruct the array based on waypoint_order from Google Maps
        // Note: waypoint_order ONLY contains intermediate points.
        // The first point (origin) and last point (destination) remain unchanged.
        const origin = routePlaces[0];
        const destination = routePlaces[routePlaces.length - 1];
        const intermediatePoints = routePlaces.slice(1, -1);
        
        const optimizedIntermediate = data.waypointOrder.map(index => intermediatePoints[index]);
        
        const optimizedPlaces = [origin, ...optimizedIntermediate, destination];
        setRoutePlaces(optimizedPlaces);
        
        toast({ title: 'Suksess', description: 'Ruten ble optimalisert for korteste kjøretid!' });
      } else {
         toast({ title: 'Info', description: 'Ruten er allerede optimal.' });
      }
    } catch (err: any) {
      console.error('Error optimizing:', err);
      toast({ title: 'Feil', description: 'Kunne ikke optimalisere ruten.', variant: 'destructive' });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSave = async () => {`
);

// Add the Optimize button to the UI
content = content.replace(
  /          <Button onClick=\{handleSave\} disabled=\{isSaving\}>\n            \{isSaving \? <Loader2 className="mr-2 h-4 w-4 animate-spin" \/> : 'Lagre'\}\n          <\/Button>/g,
  `          {routePlaces.length > 2 && (
             <Button variant="outline" onClick={handleOptimizeRoute} disabled={isOptimizing || isSaving}>
               {isOptimizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
               Optimer
             </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Lagre'}
          </Button>`
);

fs.writeFileSync(file, content);
