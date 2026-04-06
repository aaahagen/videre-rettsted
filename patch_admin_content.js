const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/admin/admin-content.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add depot settings to state
content = content.replace(
  "field3Placeholder: ''",
  "field3Placeholder: '', depotAddress: '', depotLat: '', depotLng: '', depotRadius: 500"
);

// 2. Load depot settings from org
content = content.replace(
  "field3Placeholder: org.fieldSettings?.field3?.placeholder || ''",
  "field3Placeholder: org.fieldSettings?.field3?.placeholder || '', depotAddress: org.mainDepot?.address || '', depotLat: org.mainDepot?.coordinates?.lat?.toString() || '', depotLng: org.mainDepot?.coordinates?.lng?.toString() || '', depotRadius: org.mainDepot?.radius || 500"
);

// 3. Save depot settings
const updateStart = content.indexOf('await firebaseDB.updateOrganization(organization.id, {');
const updateEnd = content.indexOf('});', updateStart) + 3;
const oldUpdate = content.slice(updateStart, updateEnd);

const newUpdate = `await firebaseDB.updateOrganization(organization.id, {
        name: orgSettings.name,
        orgNumber: orgSettings.orgNumber,
        mainDepot: {
          address: orgSettings.depotAddress,
          coordinates: { lat: parseFloat(orgSettings.depotLat) || 0, lng: parseFloat(orgSettings.depotLng) || 0 },
          radius: orgSettings.depotRadius
        },
        fieldSettings: {
          description: { enabled: orgSettings.descEnabled, label: orgSettings.descLabel, placeholder: orgSettings.descPlaceholder },
          notes: { enabled: orgSettings.notesEnabled, label: orgSettings.notesLabel, placeholder: orgSettings.notesPlaceholder },
          field3: { enabled: orgSettings.field3Enabled, label: orgSettings.field3Label, placeholder: orgSettings.field3Placeholder }
        }
      });`;
content = content.replace(oldUpdate, newUpdate);

// 4. Add UI
const insertUI = `<div className="space-y-4 pt-6 border-t">
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
              </div>`;
content = content.replace('<Button type="submit" disabled={isSavingSettings}', insertUI + '\n              <Button type="submit" disabled={isSavingSettings}');

fs.writeFileSync(filePath, content);
console.log('Fixed admin-content.tsx safely');
