const fs = require('fs');

let code = fs.readFileSync('src/app/dashboard/favorites/page.tsx', 'utf8');

const doorCodeCard = `
            {places.length > 0 && places.some(p => p.doorCode) && (
              <div className="mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Dørkoder / Nøkler</CardTitle>
                    <CardDescription>Oversikt over koder for dine favoritter</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {places.filter(p => p.doorCode).map(place => (
                        <div key={place.id} className="p-4 border rounded-lg bg-slate-50 flex flex-col justify-between">
                            <p className="font-semibold text-sm truncate">{place.name}</p>
                            <p className="text-xs text-muted-foreground truncate mb-2">{place.address}</p>
                            <div className="mt-auto bg-white border px-3 py-2 rounded font-mono text-center text-lg font-bold tracking-widest text-primary">
                                {place.doorCode}
                            </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
`;

code = code.replace('<CardContent className="px-0">', '<CardContent className="px-0">\n' + doorCodeCard);

fs.writeFileSync('src/app/dashboard/favorites/page.tsx', code);
