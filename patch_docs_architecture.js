const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'docs/ARCHITECTURE.md');
let content = fs.readFileSync(filePath, 'utf8');

const newSchemas = `
### /organizations/{orgId}/vehicles/{vehicleId}
- name: string
- registrationNumber: string
- type: 'truck' | 'van' | 'car'
- fuelType: 'diesel' | 'electric' | 'gas' | 'hybrid'
- capacity: map (weight, volume, pallets)
- capabilities: map (refrigeration, tailLift, adr, trailerCoupling)
- status: 'active' | 'maintenance' | 'inactive'

### /users/{userId}
- name: string
- email: string
- role: "driver" | "admin"
- orgId: string
- favorites: array
- workingHours: map (start, end)
- rotation: map (startDate, weeks array)
- scheduleOverrides: map (date -> type, start, end)
- certifications: array (of strings)
- skills: array (of strings)

### /routes/{routeId}
- name: string
- orgId: string
- places: array
- driverId: string
- vehicleId: string (optional, assigns a specific vehicle from the fleet)
`;

// Replace the old user and route schemas
content = content.replace(
    /### \/users\/\{userId\}[\s\S]*?- favorites: array \(of placeIds\)/,
    "### /users/{userId}\n- name: string\n- email: string\n- role: \"driver\" | \"admin\"\n- orgId: string\n- favorites: array (of placeIds)\n- workingHours: map (start, end)\n- rotation: map (startDate, weeks array)\n- scheduleOverrides: map (date string -> type, start, end)\n- certifications: array (of strings)\n- skills: array (of strings)"
);

content = content.replace(
    /### \/routes\/\{routeId\}[\s\S]*?- driverId: string \(optional, assigns route to a specific driver\)/,
    "### /routes/{routeId}\n- name: string\n- orgId: string\n- places: array (ordered list of placeIds)\n- driverId: string (optional, assigns route to a specific driver)\n- vehicleId: string (optional, assigns route to a specific vehicle)"
);

// Add vehicles schema if it doesn't exist
if (!content.includes('/organizations/{orgId}/vehicles/{vehicleId}')) {
    content = content.replace(
        "### /routes/{routeId}",
        "### /organizations/{orgId}/vehicles/{vehicleId}\n- name: string\n- registrationNumber: string\n- type: 'truck' | 'van' | 'car'\n- fuelType: 'diesel' | 'electric' | 'gas' | 'hybrid'\n- capacity: map (weight, volume, pallets)\n- capabilities: map (refrigeration, tailLift, adr, trailerCoupling)\n- status: 'active' | 'maintenance' | 'inactive'\n\n### /routes/{routeId}"
    );
}

fs.writeFileSync(filePath, content);
console.log('Updated ARCHITECTURE.md');
