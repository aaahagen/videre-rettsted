const fs = require('fs');

let content = fs.readFileSync('src/app/dashboard/routes/[id]/page.tsx', 'utf8');

content = content.replace(
  /        const optimizedIntermediate = data\.waypointOrder\.map\(index => intermediatePoints\[index\]\);\n        \n        const optimizedPlaces = \[origin, \.\.\.optimizedIntermediate, destination\];\n        setRoutePlaces\(optimizedPlaces\);/g,
  `        const optimizedIntermediate = data.waypointOrder.map(index => intermediatePoints[index]);
        
        const optimizedPlaces = [origin, ...optimizedIntermediate, destination];
        
        // Ensure state is updated correctly by checking array length
        if (optimizedPlaces.length === routePlaces.length) {
            setRoutePlaces(optimizedPlaces);
        } else {
            console.error('Mismatch in optimized places array length', optimizedPlaces, routePlaces);
        }`
);

fs.writeFileSync('src/app/dashboard/routes/[id]/page.tsx', content);
