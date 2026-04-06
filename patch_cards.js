const fs = require('fs');
const path = './src/app/dashboard/page.tsx';
let code = fs.readFileSync(path, 'utf8');

const UItoReplace = `            <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <UserIcon className="h-6 w-6 text-primary" />
                    Personell
                </h2>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
                    <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-3 flex flex-col items-center justify-center text-center">
                        <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mb-1" />
                        <p className="text-lg sm:text-2xl font-bold text-blue-900">{workforceStats.working}</p>
                        <p className="text-[9px] sm:text-xs font-medium text-blue-700 uppercase tracking-tighter">På jobb</p>
                    </div>
                    <div className="bg-white rounded-xl border border-red-100 shadow-sm p-3 flex flex-col items-center justify-center text-center">
                        <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 mb-1" />
                        <p className="text-lg sm:text-2xl font-bold text-red-900">{workforceStats.sick}</p>
                        <p className="text-[9px] sm:text-xs font-medium text-red-700 uppercase tracking-tighter">Syk</p>
                    </div>
                    <div className="bg-white rounded-xl border border-green-100 shadow-sm p-3 flex flex-col items-center justify-center text-center">
                        <Palmtree className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mb-1" />
                        <p className="text-lg sm:text-2xl font-bold text-green-900">{workforceStats.vacation}</p>
                        <p className="text-[9px] sm:text-xs font-medium text-green-700 uppercase tracking-tighter">Ferie</p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex flex-col items-center justify-center text-center">
                        <Coffee className="h-5 w-5 sm:h-6 sm:w-6 text-slate-500 mb-1" />
                        <p className="text-lg sm:text-2xl font-bold text-slate-700">{workforceStats.off}</p>
                        <p className="text-[9px] sm:text-xs font-medium text-slate-500 uppercase tracking-tighter">Fridag</p>
                    </div>
                    <div className="bg-white rounded-xl border border-amber-100 shadow-sm p-3 flex flex-col items-center justify-center text-center">
                        <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 mb-1" />
                        <p className="text-lg sm:text-2xl font-bold text-amber-900">{workforceStats.contractors}</p>
                        <p className="text-[9px] sm:text-xs font-medium text-amber-700 uppercase tracking-tighter">Innleid</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <RouteIcon className="h-6 w-6 text-primary" />
                    Ruter & Stopp
                </h2>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex flex-col items-center p-4 bg-slate-50 rounded-lg">
                        <span className="text-3xl font-bold text-slate-900">{monitorStats.total}</span>
                        <span className="text-sm text-muted-foreground">Totale Ruter</span>
                        </div>
                        <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
                        <span className="text-3xl font-bold text-blue-600">{monitorStats.active}</span>
                        <span className="text-sm text-blue-600/80">Aktive Ruter</span>
                        </div>
                        <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
                        <span className="text-3xl font-bold text-green-600">{monitorStats.finished}</span>
                        <span className="text-sm text-green-600/80">Fullførte Ruter</span>
                        </div>
                        <div className="flex flex-col items-center p-4 bg-primary/5 rounded-lg">
                        <span className="text-3xl font-bold text-primary">{monitorStats.totalPlaces}</span>
                        <span className="text-sm text-primary/80">Totale Stopp</span>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                        <span className="font-medium text-slate-700">Total Fremdrift for Dagen</span>
                        <span className="text-muted-foreground">{monitorStats.completedPlaces} / {monitorStats.totalPlaces} stopp fullført ({Math.round(overallProgress)}%)</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-primary transition-all duration-500" style={{ width: \`\${overallProgress}%\` }} />
                        </div>
                    </div>
                </div>
            </div>`;


const newUI = `            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                        <UserIcon className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Personell</h2>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
                    <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 flex flex-col items-center justify-center text-center hover:bg-slate-100 transition-colors">
                        <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mb-1" />
                        <p className="text-lg sm:text-2xl font-bold text-blue-900">{workforceStats.working}</p>
                        <p className="text-[9px] sm:text-xs font-medium text-blue-700 uppercase tracking-tighter">På jobb</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 flex flex-col items-center justify-center text-center hover:bg-slate-100 transition-colors">
                        <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 mb-1" />
                        <p className="text-lg sm:text-2xl font-bold text-red-900">{workforceStats.sick}</p>
                        <p className="text-[9px] sm:text-xs font-medium text-red-700 uppercase tracking-tighter">Syk</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 flex flex-col items-center justify-center text-center hover:bg-slate-100 transition-colors">
                        <Palmtree className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mb-1" />
                        <p className="text-lg sm:text-2xl font-bold text-green-900">{workforceStats.vacation}</p>
                        <p className="text-[9px] sm:text-xs font-medium text-green-700 uppercase tracking-tighter">Ferie</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 flex flex-col items-center justify-center text-center hover:bg-slate-100 transition-colors">
                        <Coffee className="h-5 w-5 sm:h-6 sm:w-6 text-slate-500 mb-1" />
                        <p className="text-lg sm:text-2xl font-bold text-slate-700">{workforceStats.off}</p>
                        <p className="text-[9px] sm:text-xs font-medium text-slate-500 uppercase tracking-tighter">Fridag</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 flex flex-col items-center justify-center text-center hover:bg-slate-100 transition-colors">
                        <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 mb-1" />
                        <p className="text-lg sm:text-2xl font-bold text-amber-900">{workforceStats.contractors}</p>
                        <p className="text-[9px] sm:text-xs font-medium text-amber-700 uppercase tracking-tighter">Innleid</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                        <RouteIcon className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Ruter & Stopp</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="flex flex-col items-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-3xl font-bold text-slate-900">{monitorStats.total}</span>
                    <span className="text-sm text-muted-foreground">Totale Ruter</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg border border-blue-100/50">
                    <span className="text-3xl font-bold text-blue-600">{monitorStats.active}</span>
                    <span className="text-sm text-blue-600/80">Aktive Ruter</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg border border-green-100/50">
                    <span className="text-3xl font-bold text-green-600">{monitorStats.finished}</span>
                    <span className="text-sm text-green-600/80">Fullførte Ruter</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <span className="text-3xl font-bold text-primary">{monitorStats.totalPlaces}</span>
                    <span className="text-sm text-primary/80">Totale Stopp</span>
                    </div>
                </div>
                
                <div className="space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700">Total Fremdrift for Dagen</span>
                    <span className="text-muted-foreground font-medium">{monitorStats.completedPlaces} / {monitorStats.totalPlaces} stopp fullført ({Math.round(overallProgress)}%)</span>
                    </div>
                    <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-500" style={{ width: \`\${overallProgress}%\` }} />
                    </div>
                </div>
            </div>`;


code = code.replace(UItoReplace, newUI);

// Let's also wrap the Operativ oversikt and the TimeStamp card in a similar header style if needed to make them completely uniform
const opOversiktReplace = `<h3 className="text-lg font-bold text-slate-900 mb-2">Operativ oversikt</h3>`;
const opOversiktNew = `<div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                                <RouteIcon className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Operativ oversikt</h3>
                        </div>`;
code = code.replace(opOversiktReplace, opOversiktNew);


fs.writeFileSync(path, code);
console.log("Wrapped elements in cards nicely");