const fs = require('fs');

let code = fs.readFileSync('src/app/dashboard/admin/admin-content.tsx', 'utf8');

code = code.replace(
`    notesLabel: '',
    notesPlaceholder: '',
    contactPersonsEnabled: false,`,
`    notesLabel: '',
    notesPlaceholder: '',
    field3Enabled: false,
    field3Label: '',
    field3Placeholder: '',
    contactPersonsEnabled: false,`
);

code = code.replace(
`              notesLabel: org.fieldSettings?.notes?.label || '',
              notesPlaceholder: org.fieldSettings?.notes?.placeholder || '',
              contactPersonsEnabled: org.fieldSettings?.contactPersons?.enabled ?? false,`,
`              notesLabel: org.fieldSettings?.notes?.label || '',
              notesPlaceholder: org.fieldSettings?.notes?.placeholder || '',
              field3Enabled: org.fieldSettings?.field3?.enabled ?? false,
              field3Label: org.fieldSettings?.field3?.label || '',
              field3Placeholder: org.fieldSettings?.field3?.placeholder || '', 
              contactPersonsEnabled: org.fieldSettings?.contactPersons?.enabled ?? false,`
);

code = code.replace(
`          notes: { enabled: orgSettings.notesEnabled, label: orgSettings.notesLabel, placeholder: orgSettings.notesPlaceholder },
          contactPersons: { enabled: orgSettings.contactPersonsEnabled, label: orgSettings.contactPersonsLabel, placeholder: orgSettings.contactPersonsPlaceholder }`,
`          notes: { enabled: orgSettings.notesEnabled, label: orgSettings.notesLabel, placeholder: orgSettings.notesPlaceholder },
          field3: { enabled: orgSettings.field3Enabled, label: orgSettings.field3Label, placeholder: orgSettings.field3Placeholder },
          contactPersons: { enabled: orgSettings.contactPersonsEnabled, label: orgSettings.contactPersonsLabel, placeholder: orgSettings.contactPersonsPlaceholder }`
);


const oldContactPersonAdminHtml = `{/* Felt 3 */}
                    <div className="space-y-4 p-4 rounded-lg border bg-slate-50/50">
                      <div className="flex items-center justify-between">
                         <Label className="text-base font-semibold">Kontaktpersoner</Label>
                         <Switch 
                            checked={orgSettings.contactPersonsEnabled} 
                            onCheckedChange={(checked) => setOrgSettings(s => ({ ...s, contactPersonsEnabled: checked }))} 
                         />
                      </div>
                      <div className={\`space-y-4 \${!orgSettings.contactPersonsEnabled && 'opacity-50 pointer-events-none'}\`}>
                        <div className="space-y-2">
                          <Label htmlFor="contactPersonsLabel" className="text-xs">Etikett (Label)</Label>
                          <Input
                            id="contactPersonsLabel"
                            placeholder="F.eks. Kontaktpersoner"
                            value={orgSettings.contactPersonsLabel}
                            onChange={(e) => setOrgSettings(s => ({ ...s, contactPersonsLabel: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          {/* <Label htmlFor="contactPersonsPlaceholder" className="text-xs">Plassholder</Label> */}
                          {/* <Input
                            id="contactPersonsPlaceholder"
                            placeholder="F.eks. 1234*"
                            value={orgSettings.contactPersonsPlaceholder}
                            onChange={(e) => setOrgSettings(s => ({ ...s, contactPersonsPlaceholder: e.target.value }))}
                          /> */}
                        </div>
                      </div>
                    </div>`;


const newContactPersonAndField3AdminHtml = `{/* Felt 3 */}
                    <div className="space-y-4 p-4 rounded-lg border bg-slate-50/50">
                      <div className="flex items-center justify-between">
                         <Label className="text-base font-semibold">Felt 3</Label>
                         <Switch 
                            checked={orgSettings.field3Enabled} 
                            onCheckedChange={(checked) => setOrgSettings(s => ({ ...s, field3Enabled: checked }))} 
                         />
                      </div>
                      <div className={\`space-y-4 \${!orgSettings.field3Enabled && 'opacity-50 pointer-events-none'}\`}>
                        <div className="space-y-2">
                          <Label htmlFor="field3Label" className="text-xs">Etikett (Label)</Label>
                          <Input
                            id="field3Label"
                            placeholder="F.eks. Kode til port"
                            value={orgSettings.field3Label}
                            onChange={(e) => setOrgSettings(s => ({ ...s, field3Label: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="field3Placeholder" className="text-xs">Plassholder</Label>
                          <Input
                            id="field3Placeholder"
                            placeholder="F.eks. 1234*"
                            value={orgSettings.field3Placeholder}
                            onChange={(e) => setOrgSettings(s => ({ ...s, field3Placeholder: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                    {/* Kontaktpersoner */}
                    <div className="space-y-4 p-4 rounded-lg border bg-slate-50/50">
                      <div className="flex items-center justify-between">
                         <Label className="text-base font-semibold">Kontaktpersoner</Label>
                         <Switch 
                            checked={orgSettings.contactPersonsEnabled} 
                            onCheckedChange={(checked) => setOrgSettings(s => ({ ...s, contactPersonsEnabled: checked }))} 
                         />
                      </div>
                      <div className={\`space-y-4 \${!orgSettings.contactPersonsEnabled && 'opacity-50 pointer-events-none'}\`}>
                        <div className="space-y-2">
                          <Label htmlFor="contactPersonsLabel" className="text-xs">Etikett (Label)</Label>
                          <Input
                            id="contactPersonsLabel"
                            placeholder="F.eks. Kontaktpersoner"
                            value={orgSettings.contactPersonsLabel}
                            onChange={(e) => setOrgSettings(s => ({ ...s, contactPersonsLabel: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>`;

code = code.replace(oldContactPersonAdminHtml, newContactPersonAndField3AdminHtml);

fs.writeFileSync('src/app/dashboard/admin/admin-content.tsx', code);
