const fs = require('fs');
const file = 'src/app/dashboard/routes/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetFunc = `  const toggleItemCompletion = async (itemId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const isNowCompleted = !completedStops[itemId];
    setCompletedStops(prev => ({ ...prev, [itemId]: isNowCompleted }));
    
    if (route && userData?.role !== 'admin') {
      try {
        const currentCompletedStops = Object.entries({ ...completedStops, [itemId]: isNowCompleted }).filter(([_, isCompleted]) => isCompleted).map(([id]) => id);
        await firebaseDB.updateRoute(routeId, { completedStops: currentCompletedStops });
      } catch (err) {
        console.error('Error auto-saving completed stop:', err);
        setCompletedStops(prev => ({ ...prev, [itemId]: !isNowCompleted }));
        toast({ title: 'Feil', description: 'Kunne ikke lagre status.', variant: 'destructive' });
      }
    }
  };`;

const newFunc = `  const toggleItemCompletion = async (itemId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const isNowCompleted = !completedStops[itemId];
    setCompletedStops(prev => ({ ...prev, [itemId]: isNowCompleted }));

    let newEvents = { ...completedStopEvents };

    if (isNowCompleted && itemId.startsWith('place_')) {
      const placeId = itemId.replace('place_', '');
      let coords;
      try {
        coords = await getPosition();
      } catch (e) {
        console.warn('Could not get location', e);
      }
      
      const newEvent: CompletedStopEvent = {
        placeId,
        timestamp: new Date().toISOString(),
      };
      if (coords) {
          newEvent.coordinates = coords;
      }
      newEvents[itemId] = newEvent;
    } else {
      delete newEvents[itemId];
    }
    setCompletedStopEvents(newEvents);
    
    if (route && userData?.role !== 'admin') {
      try {
        const currentCompletedStops = Object.entries({ ...completedStops, [itemId]: isNowCompleted }).filter(([_, isCompleted]) => isCompleted).map(([id]) => id);
        
        await firebaseDB.updateRoute(routeId, { 
            completedStops: currentCompletedStops,
            completedStopEvents: newEvents
        });
      } catch (err) {
        console.error('Error auto-saving completed stop:', err);
        setCompletedStops(prev => ({ ...prev, [itemId]: !isNowCompleted }));
        setCompletedStopEvents(completedStopEvents); // Revert
        toast({ title: 'Feil', description: 'Kunne ikke lagre status.', variant: 'destructive' });
      }
    }
  };`;

content = content.replace(targetFunc, newFunc);
fs.writeFileSync(file, content);
