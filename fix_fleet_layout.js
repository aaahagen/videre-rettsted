const fs = require('fs');
const path = require('path');

let fleetPath = path.join(__dirname, 'src/app/dashboard/fleet/page.tsx');
let fleetCode = fs.readFileSync(fleetPath, 'utf8');

const regex = /<Card>[\s\S]*?<\/Card>/;

const replacement = `{filteredVehicles.length === 0 && searchQuery ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-slate-200">
                        <div className="rounded-full bg-slate-100 p-6 mb-4">
                            <SearchX className="h-12 w-12 text-slate-300" />
                        </div>
                        <h2 className="text-xl font-semibold text-slate-900">
                            Ingen kjøretøy matchet "{searchQuery}"
                        </h2>
                    </div>
                ) : vehicles.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground bg-white rounded-xl border border-slate-200">
                        <Truck className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>Ingen kjøretøy registrert ennå.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredVehicles.map(v => (
                            <Card key={v.id} className="flex flex-col h-full hover:shadow-md transition-shadow relative">
                                <CardHeader className="pb-3 flex flex-row items-start justify-between">
                                    <div>
                                        <CardTitle className="text-xl font-bold">{v.name}</CardTitle>
                                        <div className="flex gap-2 mt-2">
                                            <Badge variant="outline">{v.registrationNumber}</Badge>
                                            <Badge variant={v.status === 'active' ? 'default' : v.status === 'maintenance' ? 'destructive' : 'secondary'}>
                                                {v.status === 'active' ? 'I drift' : v.status === 'maintenance' ? 'Verksted' : 'Inaktiv'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1 items-end -mt-2 -mr-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900" onClick={() => handleOpenForm(v)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(v.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0 flex-grow flex flex-col justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                            <Truck className="h-4 w-4" />
                                            <span>{v.type === 'truck' ? 'Lastebil' : v.type === 'van' ? 'Varebil' : 'Personbil'}</span>
                                            {v.documents && v.documents.length > 0 && (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <span className="flex items-center gap-1 ml-auto text-primary cursor-pointer bg-primary/10 px-2 py-0.5 rounded-full text-xs font-medium">
                                                            <FileText className="h-3 w-3" /> {v.documents.length} doc
                                                        </span>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{v.documents.length} dokument(er) lastet opp</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2 text-xs">
                                            {v.capabilities?.tailLift && <Badge variant="secondary">Lift</Badge>}
                                            {v.capabilities?.refrigeration && <Badge variant="secondary">Kjøl/Frys</Badge>}
                                            {v.capabilities?.trailerCoupling && <Badge variant="secondary">Hengerfeste</Badge>}
                                            {v.capabilities?.adr && <Badge variant="destructive" className="bg-amber-100 text-amber-800 border-amber-200">ADR</Badge>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}`;

fleetCode = fleetCode.replace(regex, replacement);
fs.writeFileSync(fleetPath, fleetCode);
