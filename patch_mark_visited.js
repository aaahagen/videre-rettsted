const fs = require('fs');
const file = 'src/app/dashboard/routes/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Update import to include markPlaceVisited
const importTarget = `import { firebaseDB } from '@/lib/firebase/database';`;
const newImport = `import { firebaseDB, markPlaceVisited } from '@/lib/firebase/database';`;
content = content.replace(importTarget, newImport);

// Find toggleItemCompletion
const toggleFunc = `        await firebaseDB.updateRoute(routeId, { 
            completedStops: currentCompletedStops,
            completedStopEvents: newEvents
        });
      } catch (err) {`;

const newToggleFunc = `        await firebaseDB.updateRoute(routeId, { 
            completedStops: currentCompletedStops,
            completedStopEvents: newEvents
        });
        
        // Gamification: Mark place as visited for the driver
        if (isNowCompleted && itemId.startsWith('place_')) {
           const placeId = itemId.replace('place_', '');
           if (userData?.id) {
               try {
                  await markPlaceVisited(userData.id, placeId);
               } catch (e) {
                  console.error("Could not mark place as visited", e);
               }
           }
        }
      } catch (err) {`;

content = content.replace(toggleFunc, newToggleFunc);
fs.writeFileSync(file, content);
