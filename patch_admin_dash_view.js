const fs = require('fs');
const path = './src/app/dashboard/page.tsx';
let code = fs.readFileSync(path, 'utf8');

const adminSectionToReplace = `/* ADMIN VIEW */
        <div className="space-y-8 max-w-5xl mx-auto">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TimeStampCard user={userData} />
                
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-center">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Operativ oversikt</h3>
                    <p className="text-slate-500 text-sm">
                        Bruk navigasjonen under for rask tilgang til operative verktøy.
                    </p>
                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/dashboard/monitor">Overvåkning</Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/dashboard/routes">Alle Ruter</Link>
                        </Button>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link href="/dashboard/places" className="group bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-primary transition-all">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary rounded-lg transition-colors">
                            <MapPin className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-slate-700 group-hover:text-primary">Steder</span>
                    </div>
                </Link>
                
                <Link href="/dashboard/messages" className="group bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-primary transition-all">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary rounded-lg transition-colors">
                            <MessageSquare className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-slate-700 group-hover:text-primary">Meldinger</span>
                    </div>
                </Link>

                <Link href="/dashboard/routes" className="group bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-primary transition-all">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary rounded-lg transition-colors">
                            <RouteIcon className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-slate-700 group-hover:text-primary">Alle Ruter</span>
                    </div>
                </Link>
            </div>
        </div>
      ) : (`;

const newAdminSection = `/* ADMIN VIEW */
        <div className="space-y-8 max-w-5xl mx-auto">
            {userData.orgId && <AnalyticsDashboard orgId={userData.orgId} />}
            {userData.orgId && <PendingInvitations orgId={userData.orgId} />}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TimeStampCard user={userData} />
                
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-center">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Operativ oversikt</h3>
                    <p className="text-slate-500 text-sm">
                        Bruk navigasjonen under for rask tilgang til operative verktøy.
                    </p>
                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/dashboard/monitor">Overvåkning</Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/dashboard/routes">Alle Ruter</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
      ) : (`

code = code.replace(adminSectionToReplace, newAdminSection);

fs.writeFileSync(path, code);
console.log("Updated admin dashboard view");