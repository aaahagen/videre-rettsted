const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/admin/admin-content.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update State
content = content.replace(
    'field3Placeholder: \'\'',
    `field3Placeholder: '',
    depotAddress: '',
    depotLat: '',
    depotLng: '',
    depotRadius: 500`
);

// 2. Update setOrgSettings in useEffect
content = content.replace(
    'field3Placeholder: org.fieldSettings?.field3?.placeholder || \'\'',
    `field3Placeholder: org.fieldSettings?.field3?.placeholder || '',
              depotAddress: org.mainDepot?.address || '',
              depotLat: org.mainDepot?.coordinates?.lat?.toString() || '',
              depotLng: org.mainDepot?.coordinates?.lng?.toString() || '',
              depotRadius: org.mainDepot?.radius || 500`
);

// 3. Update handleSaveSettings
content = content.replace(
    'field3: {',
    `mainDepot: {
          address: orgSettings.depotAddress,
          coordinates: {
            lat: parseFloat(orgSettings.depotLat) || 0,
            lng: parseFloat(orgSettings.depotLng) || 0
          },
          radius: orgSettings.depotRadius
        },
        field3: {`
);

// 4. Add UI Fields before the submit button
const insertionPoint = '<Button type="submit"';
const depotUI = `
              <div className="space-y-4 pt-6 border-t">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Hoveddepot & Geofencing</h3>
                  <p className="text-xs text-slate-500 italic">Sett lokasjonen for organisasjonens hoveddepot. Dette brukes til å verifisere inn- og utstempling for sjåfører med fast oppmøte.</p>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="depotAddress">Adresse</Label>
                      <Input
                        id="depotAddress"
                        placeholder="F.eks. Storgata 1, 0101 Oslo"
                        value={orgSettings.depotAddress}
                        onChange={(e) => setOrgSettings(s => ({ ...s, depotAddress: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="depotLat">Breddegrad (Lat)</Label>
                      <Input
                        id="depotLat"
                        placeholder="59.9139"
                        value={orgSettings.depotLat}
                        onChange={(e) => setOrgSettings(s => ({ ...s, depotLat: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="depotLng">Lengdegrad (Lng)</Label>
                      <Input
                        id="depotLng"
                        placeholder="10.7522"
                        value={orgSettings.depotLng}
                        onChange={(e) => setOrgSettings(s => ({ ...s, depotLng: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-4 md:col-span-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="depotRadius">Radius for stempling: {orgSettings.depotRadius} meter</Label>
                        </div>
                        <input 
                            type="range" 
                            id="depotRadius"
                            min="100" 
                            max="5000" 
                            step="100"
                            value={orgSettings.depotRadius}
                            onChange={(e) => setOrgSettings(s => ({ ...s, depotRadius: parseInt(e.target.value) }))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                    </div>
                  </div>
              </div>

              `;

content = content.replace(insertionPoint, depotUI + insertionPoint);

fs.writeFileSync(filePath, content);
console.log('Added Depot settings to Admin Panel');
