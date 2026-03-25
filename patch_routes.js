const fs = require('fs');
const file = 'src/app/dashboard/routes/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const functions = getFunctions\(\);\s+const calculateDistanceFn = httpsCallable\(functions, 'calculateRouteDistance'\);\s+const debouncedCalculateDistance = useMemo\(\s+\(\) =>\s+debounce\(async \(places: Place\[\]\) => \{/m,
  `const debouncedCalculateDistance = useMemo(
    () =>
      debounce(async (places: Place[]) => {
        const functions = getFunctions();
        const calculateDistanceFn = httpsCallable(functions, 'calculateRouteDistance');`
);

content = content.replace(
  /\[calculateDistanceFn, toast\]\s+\);/m,
  `[toast]
  );`
);

fs.writeFileSync(file, content);
