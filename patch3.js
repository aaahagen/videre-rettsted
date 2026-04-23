const fs = require('fs');

let code = fs.readFileSync('src/app/dashboard/admin/admin-content.tsx', 'utf8');

code = code.replace(/<Label className="text-base font-semibold">Felt 3<\/Label>/g, '<Label className="text-base font-semibold">Kontaktpersoner</Label>');
code = code.replace(/<Label htmlFor="contactPersonsPlaceholder" className="text-xs">Plassholder<\/Label>/g, '{/* <Label htmlFor="contactPersonsPlaceholder" className="text-xs">Plassholder</Label> */}');
code = code.replace(/<Input\n\s*id="contactPersonsPlaceholder"\n\s*placeholder="F.eks. 1234\*"\n\s*value={orgSettings.contactPersonsPlaceholder}\n\s*onChange={\(e\) => setOrgSettings\(s => \(\{ \.\.\.s, contactPersonsPlaceholder: e.target.value \}\)\)}\n\s*\/>/g, '{/* <Input\n                            id="contactPersonsPlaceholder"\n                            placeholder="F.eks. 1234*"\n                            value={orgSettings.contactPersonsPlaceholder}\n                            onChange={(e) => setOrgSettings(s => ({ ...s, contactPersonsPlaceholder: e.target.value }))}\n                          /> */}');

fs.writeFileSync('src/app/dashboard/admin/admin-content.tsx', code);
