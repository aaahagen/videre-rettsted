const fs = require('fs');

function updateMaxWidth(file) {
    let content = fs.readFileSync(file, 'utf8');
    // Replace standard max-w-7xl (which is what we had) with max-w-7xl
    // Wait, max-w-7xl is 80rem (1280px). Admin page used max-w-7xl and user was happy with it.
    // Let's check what the others use.
    // Workforce: <div className="print:hidden container mx-auto max-w-7xl px-4 py-8 space-y-6">
    // Fleet: <div className="container mx-auto max-w-7xl px-4 py-8 space-y-6">
    // Monitor: <div className="container mx-auto max-w-7xl px-4 py-8 space-y-6">
    
    // If the user wants them constrained "the same way", maybe they don't have max-w-7xl, or maybe they want max-w-5xl? 
    // Let's check Admin: <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-x-hidden w-full">
    // The key difference is that Admin was NOT a "container" previously, it was just a div. The other pages ARE using "container mx-auto max-w-7xl".
    // Next.js tailwind "container" class by default sets max-width to the breakpoint (e.g. 1536px on 2xl screens), completely overriding max-w-7xl!
    // Ah! That's the trick! "container" overrides "max-w-7xl". We need to remove "container" or just use "w-full max-w-7xl mx-auto".
    
    content = content.replace(/container mx-auto/g, 'mx-auto w-full');
    fs.writeFileSync(file, content);
}

updateMaxWidth('src/app/dashboard/workforce/page.tsx');
updateMaxWidth('src/app/dashboard/fleet/page.tsx');
updateMaxWidth('src/app/dashboard/monitor/page.tsx');
updateMaxWidth('src/app/dashboard/routes/page.tsx'); // Fix routes overview as well
updateMaxWidth('src/app/dashboard/routes/[id]/page.tsx'); // Fix route details
updateMaxWidth('src/app/dashboard/page.tsx'); // Fix main dashboard

