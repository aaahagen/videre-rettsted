const fs = require('fs');
const file = 'src/app/dashboard/routes/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// I need to find the correct string to replace
content = content.replace(
  /        const result = await calculateDistanceFn\(\{ placeIds \}\);\n        const data = result\.data as \{ distance: number \};\n        setDistance\(\`\$\{data\.distance\.toFixed\(1\)\} km\`\);/g,
  `        const result = await calculateDistanceFn({ placeIds });
        const data = result.data as { distance: number, waypointOrder: number[] };
        setDistance(\`\${data.distance.toFixed(1)} km\`);`
);

fs.writeFileSync(file, content);
