const fs = require('fs');

let code = fs.readFileSync('src/app/dashboard/routes/[id]/page.tsx', 'utf8');

const keyCardCode = `
      {/* Required Keys Card */}
      {!isEditMode && placeItems.some(item => item.place?.doorCode && item.place.doorCode.some(dc => dc.category === 'Nøkkel')) && (
          <div className="mb-6">
              <Card className="border-amber-200 bg-amber-50 shadow-sm">
                  <CardHeader className="pb-3 border-b border-amber-100 bg-amber-100/50">
                      <CardTitle className="text-lg flex items-center text-amber-900">
                          <Key className="mr-2 h-5 w-5" />
                          Nødvendige Nøkler for Ruten
                      </CardTitle>
                      <CardDescription className="text-amber-700/80">
                          Husk å ta med disse nøklene før du forlater terminalen.
                      </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {placeItems
                              .filter(item => item.place?.doorCode && item.place.doorCode.some(dc => dc.category === 'Nøkkel'))
                              .map(item => {
                                  const keys = item.place!.doorCode!.filter(dc => dc.category === 'Nøkkel');
                                  return (
                                      <div key={item.id} className="p-3 bg-white border border-amber-200 rounded-md flex flex-col gap-2 shadow-sm">
                                          <p className="font-semibold text-sm truncate text-slate-800">{item.place?.name}</p>
                                          {keys.map((key, idx) => (
                                              <div key={idx} className="flex justify-between items-center bg-amber-50 px-2 py-1.5 rounded border border-amber-100">
                                                  <span className="text-xs font-medium text-slate-600">{key.name || 'Nøkkel'}</span>
                                                  <span className="font-mono text-sm font-bold text-amber-700">{key.value}</span>
                                              </div>
                                          ))}
                                      </div>
                                  );
                              })
                          }
                      </div>
                  </CardContent>
              </Card>
          </div>
      )}

      {/* Main Content: Places Grid */}`;

code = code.replace('{/* Main Content: Places Grid */}', keyCardCode);

// We need to import the Key icon from lucide-react
if(!code.includes('Key,')) {
    code = code.replace('Clock,', 'Clock, Key,');
}

fs.writeFileSync('src/app/dashboard/routes/[id]/page.tsx', code);
