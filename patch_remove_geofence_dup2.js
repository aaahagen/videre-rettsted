const fs = require('fs');
const path = './src/app/dashboard/admin/admin-content.tsx';
let code = fs.readFileSync(path, 'utf8');

// The issue is that there are still two identical "Hoveddepot & Geofencing" blocks inside the "Organisasjonsinnstillinger" (Organization Settings) card form.
// I will locate the second one and remove it.

const geofenceBlockRegex = /<div className="space-y-4 pt-6 border-t">\s*<h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Hoveddepot & Geofencing<\/h3>[\s\S]*?<div className="flex justify-between items-center"><Label htmlFor="depotRadius">Radius for stempling: \{orgSettings.depotRadius\} meter<\/Label><\/div>[\s\S]*?<\/div>\s*<\/div>/g;

// Find all matches
const matches = [...code.matchAll(geofenceBlockRegex)];

if (matches.length > 1) {
    // Remove the last occurrence
    const lastMatch = matches[matches.length - 1];
    code = code.substring(0, lastMatch.index) + code.substring(lastMatch.index + lastMatch[0].length);
    fs.writeFileSync(path, code);
    console.log("Removed duplicate geofencing block");
} else {
    console.log("Could not find multiple geofencing blocks with regex.");
}
