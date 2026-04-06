const fs = require('fs');
const path = './src/app/dashboard/page.tsx';
let code = fs.readFileSync(path, 'utf8');

// Need to import AnalyticsDashboard and PendingInvitations into dashboard/page.tsx
const importsToAdd = `
import { AnalyticsDashboard } from '@/components/admin/analytics-dashboard';
import { PendingInvitations } from '@/components/admin/pending-invitations';
`;

code = code.replace("import AdminDashboardContent from './admin/admin-content';", importsToAdd);

const replaceStr = `        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        God dag, {userData.name.split(' ')[0]}!
                    </h1>
                    <p className="text-slate-500 text-sm">Velkommen til ditt kontrollpanel.</p>
                </div>
            </div>

            {userData.orgId && <AnalyticsDashboard orgId={userData.orgId} />}
            {userData.orgId && <PendingInvitations orgId={userData.orgId} />}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">`;

code = code.replace(`        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        God dag, {userData.name.split(' ')[0]}!
                    </h1>
                    <p className="text-slate-500 text-sm">Velkommen til ditt kontrollpanel.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">`, replaceStr);

fs.writeFileSync(path, code);
console.log("Added to dashboard page");