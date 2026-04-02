const fs = require('fs');
const path = require('path');

let workforcePath = path.join(__dirname, 'src/app/dashboard/workforce/page.tsx');
let workforceCode = fs.readFileSync(workforcePath, 'utf8');

// 1. Add useMemo
if (!workforceCode.includes('useMemo')) {
    workforceCode = workforceCode.replace(
        "import { useState, useEffect } from 'react';",
        "import { useState, useEffect, useMemo } from 'react';"
    );
}

// 2. Add icons
workforceCode = workforceCode.replace(
    "import { Users, Loader2, Search, Printer, User as UserIcon, FileText, Edit, CalendarDays } from 'lucide-react';",
    "import { Users, Loader2, Search, Printer, User as UserIcon, FileText, Edit, CalendarDays, UserCheck, Activity, Palmtree, Coffee, Briefcase } from 'lucide-react';"
);

// 3. Add stats logic right after searchDate parsing
const searchDateLogic = `    if (searchDateStr) {
        const [year, month, day] = searchDateStr.split('-');
        if (year && month && day) {
            searchDate = new Date(Number(year), Number(month) - 1, Number(day));
        }
    }`;

const statsLogic = `    const stats = useMemo(() => {
        let working = 0;
        let sick = 0;
        let vacation = 0;
        let off = 0;
        let contractors = 0;

        drivers.forEach(driver => {
            if (driver.role === 'contractor' || driver.employmentType === 'external') {
                contractors++;
            }
            
            const statusInfo = getDriverStatus(driver, searchDate);
            if (statusInfo.type === 'working') working++;
            else if (statusInfo.type === 'sick') sick++;
            else if (statusInfo.type === 'vacation') vacation++;
            else if (statusInfo.type === 'off') off++;
        });

        return { working, sick, vacation, off, contractors, total: drivers.length };
    }, [drivers, searchDate]);`;

workforceCode = workforceCode.replace(searchDateLogic, searchDateLogic + "\n\n" + statsLogic);

// 4. Add UI
const mainAppContentHeader = `                        <p className="text-muted-foreground mt-2">
                            Søk etter personell og se tilgjengelighet og arbeidsplan for en spesifikk dato.
                        </p>
                    </div>
                </div>`;

const statsUI = `
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <Card className="bg-blue-50 border-blue-100 shadow-sm">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <UserCheck className="h-6 w-6 text-blue-600 mb-2" />
                            <p className="text-2xl font-bold text-blue-900">{stats.working}</p>
                            <p className="text-xs font-medium text-blue-700 uppercase tracking-wider">På jobb</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-red-50 border-red-100 shadow-sm">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <Activity className="h-6 w-6 text-red-600 mb-2" />
                            <p className="text-2xl font-bold text-red-900">{stats.sick}</p>
                            <p className="text-xs font-medium text-red-700 uppercase tracking-wider">Syk</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-green-100 shadow-sm">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <Palmtree className="h-6 w-6 text-green-600 mb-2" />
                            <p className="text-2xl font-bold text-green-900">{stats.vacation}</p>
                            <p className="text-xs font-medium text-green-700 uppercase tracking-wider">Ferie</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-50 border-slate-200 shadow-sm">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <Coffee className="h-6 w-6 text-slate-500 mb-2" />
                            <p className="text-2xl font-bold text-slate-700">{stats.off}</p>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Fridag</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-amber-50 border-amber-100 shadow-sm col-span-2 md:col-span-1 lg:col-span-1">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <Briefcase className="h-6 w-6 text-amber-600 mb-2" />
                            <p className="text-2xl font-bold text-amber-900">{stats.contractors}</p>
                            <p className="text-xs font-medium text-amber-700 uppercase tracking-wider">Innleid (Totalt)</p>
                        </CardContent>
                    </Card>
                </div>
`;

workforceCode = workforceCode.replace(mainAppContentHeader, mainAppContentHeader + "\n" + statsUI);

fs.writeFileSync(workforcePath, workforceCode);
