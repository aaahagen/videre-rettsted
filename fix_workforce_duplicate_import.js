const fs = require('fs');
const path = require('path');

let workforcePath = path.join(__dirname, 'src/app/dashboard/workforce/page.tsx');
let workforceCode = fs.readFileSync(workforcePath, 'utf8');

// Remove duplicate import and useEffect
workforceCode = workforceCode.replace(
    "import { useSearch } from '@/hooks/use-search';\nimport { useSearch } from '@/hooks/use-search';",
    "import { useSearch } from '@/hooks/use-search';"
);

workforceCode = workforceCode.replace(
    `    useEffect(() => {
        setContext('Personell', '/dashboard/admin');
        return () => setContext('Steder', '/dashboard/new');
    }, [setContext]);

    useEffect(() => {
        setContext('Personell', '/dashboard/admin'); // No direct 'new worker' page, usually done via invitations in admin
    }, [setContext]);`,
    `    useEffect(() => {
        setContext('Personell', '/dashboard/admin'); // Redirects to admin page where invitations are sent
        return () => setContext('Steder', '/dashboard/new');
    }, [setContext]);`
);

fs.writeFileSync(workforcePath, workforceCode);
