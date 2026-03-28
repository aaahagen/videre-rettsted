const fs = require('fs');

const routesDetailsFile = 'src/app/dashboard/routes/[id]/page.tsx';
let code = fs.readFileSync(routesDetailsFile, 'utf8');

const originalSaveFn = `  const handleSave = async () => {
    if (!route) return;
    setIsSaving(true);
    try {
      const updatedRoute = {
        ...route,
        places: routePlaces.map(p => p.id),
        prepTimeStart,
        prepTimeEnd,
        breakTime,
        fuelServiceTime
      };`;

const replacementSaveFn = `  const handleSave = async () => {
    if (!route) return;
    setIsSaving(true);
    try {
      const updatedRoute = {
        ...route,
        places: routePlaces.map(p => p.id),
        prepTimeStart,
        prepTimeEnd,
        breakTime,
        fuelServiceTime,
        duration: duration === 'N/A' ? null : duration,
      };`;

code = code.replace(originalSaveFn, replacementSaveFn);
fs.writeFileSync(routesDetailsFile, code);
