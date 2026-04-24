const fs = require('fs');

let code = fs.readFileSync('src/app/dashboard/favorites/page.tsx', 'utf8');

const oldCard = `            {places.length > 0 && places.some(p => p.doorCode && p.doorCode.length > 0) && (
              <div className="mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Dørkoder / Nøkler</CardTitle>
                    <CardDescription>Oversikt over koder for dine favoritter</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {places.filter(p => p.doorCode && p.doorCode.length > 0).map(place => (
                        <div key={place.id} className="p-4 border rounded-lg bg-slate-50 flex flex-col gap-2">
                            <p className="font-semibold text-sm truncate">{place.name}</p>
                            <p className="text-xs text-muted-foreground truncate mb-2">{place.address}</p>
                            {place.doorCode?.map((dc, idx) => (
                                <div key={idx} className="bg-white border px-3 py-2 rounded text-sm flex justify-between items-center gap-2">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-muted-foreground uppercase">{dc.category}</span>
                                        <span className="font-medium text-slate-700">{dc.name}</span>
                                    </div>
                                    <span className="font-mono font-bold text-primary">{dc.value}</span>
                                </div>
                            ))}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}`;

const newCard = `            {places.length > 0 && places.some(p => p.doorCode && p.doorCode.some(dc => dc.category === 'Nøkkel')) && (
              <div className="mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Nøkler</CardTitle>
                    <CardDescription>Oversikt over nøkler for dine favoritter</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {places.filter(p => p.doorCode && p.doorCode.some(dc => dc.category === 'Nøkkel')).map(place => (
                        <div key={place.id} className="p-4 border rounded-lg bg-slate-50 flex flex-col gap-2">
                            <p className="font-semibold text-sm truncate">{place.name}</p>
                            {place.doorCode?.filter(dc => dc.category === 'Nøkkel').map((dc, idx) => (
                                <div key={idx} className="bg-white border px-3 py-2 rounded text-sm flex justify-between items-center gap-2">
                                    <span className="font-medium text-slate-700">{dc.name || 'Nøkkel'}</span>
                                    <span className="font-mono font-bold text-primary">{dc.value}</span>
                                </div>
                            ))}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}`;

if(code.includes('CardTitle className="text-lg">Dørkoder / Nøkler</CardTitle>')) {
    code = code.replace(oldCard, newCard);
    fs.writeFileSync('src/app/dashboard/favorites/page.tsx', code);
    console.log("Successfully patched page.tsx");
} else {
    console.log("Could not find the card to replace");
}
