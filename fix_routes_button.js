const fs = require('fs');
const path = require('path');

let routesPath = path.join(__dirname, 'src/app/dashboard/routes/page.tsx');
let routesCode = fs.readFileSync(routesPath, 'utf8');

const buttonCodeToRemove = `        {userData?.role === 'admin' && (
          <Button onClick={handleCreateRoute} className="shadow-md hover:shadow-lg transition-shadow whitespace-nowrap shrink-0">
            <Plus className="mr-2 h-5 w-5" /> Ny Rute
          </Button>
        )}`;

routesCode = routesCode.replace(buttonCodeToRemove, "");

const handleFuncToRemove = `  const handleCreateRoute = () => {
    // Generate a temporary ID or just navigate to the 'new' page
    // For now, we'll navigate to a 'new' page that handles creation
    router.push('/dashboard/routes/new');
  };`;

routesCode = routesCode.replace(handleFuncToRemove, "");

fs.writeFileSync(routesPath, routesCode);
