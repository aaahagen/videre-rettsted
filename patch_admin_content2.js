const fs = require('fs');
const path = './src/app/dashboard/admin/admin-content.tsx';
let code = fs.readFileSync(path, 'utf8');

// Need to remove AnalyticsDashboard and PendingInvitations from AdminDashboardContent

code = code.replace('{organization && <AnalyticsDashboard orgId={organization.id} />}', '');
code = code.replace('{organization && <PendingInvitations orgId={organization.id} />}', '');

fs.writeFileSync(path, code);
console.log("Removed from admin-content");
