const fs = require('fs');
const path = './src/app/dashboard/admin/admin-content.tsx';
let code = fs.readFileSync(path, 'utf8');

// I see they are exactly next to each other! Let's remove one of them.
const duplicateBlock = `              <div className="space-y-4 pt-6 border-t">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Hoveddepot & Geofencing</h3>
                  <p className="text-xs text-slate-500 italic">Sett lokasjonen for organisasjonens hoveddepot. Dette brukes til å verifisere inn- og utstempling for sjåfører med fast oppmøte.</p>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="depotAddress">Adresse</Label>
                      <Input id="depotAddress" placeholder="F.eks. Storgata 1, 0101 Oslo" value={orgSettings.depotAddress} onChange={(e) => setOrgSettings(s => ({ ...s, depotAddress: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="depotLat">Breddegrad (Lat)</Label>
                      <Input id="depotLat" placeholder="59.9139" value={orgSettings.depotLat} onChange={(e) => setOrgSettings(s => ({ ...s, depotLat: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="depotLng">Lengdegrad (Lng)</Label>
                      <Input id="depotLng" placeholder="10.7522" value={orgSettings.depotLng} onChange={(e) => setOrgSettings(s => ({ ...s, depotLng: e.target.value }))} />
                    </div>
                    <div className="space-y-4 md:col-span-2">
                        <div className="flex justify-between items-center"><Label htmlFor="depotRadius">Radius for stempling: {orgSettings.depotRadius} meter</Label></div>
                        <input type="range" id="depotRadius" min="100" max="5000" step="100" value={orgSettings.depotRadius} onChange={(e) => setOrgSettings(s => ({ ...s, depotRadius: parseInt(e.target.value) }))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" />
                    </div>
                  </div>
              </div>\n`;

code = code.replace(duplicateBlock, '');

fs.writeFileSync(path, code);
console.log("Removed the adjacent duplicate block");