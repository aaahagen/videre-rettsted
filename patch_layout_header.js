const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/layout.tsx');
let code = fs.readFileSync(filePath, 'utf8');

const oldButtonRender = `{(isAdmin || contextName === 'Steder') && (
                <div className="flex items-center gap-2">
                  <Button asChild size="sm" className="hidden sm:flex">
                    <Link href={contextLink}>
                      {contextName === 'Ruter' ? <RouteIcon className="mr-2 h-4 w-4" /> : <FilePlus2 className="mr-2 h-4 w-4" />}
                      {contextName === 'Ruter' ? 'Ny Rute' : 'Nytt Sted'}
                    </Link>
                  </Button>
                  <Button asChild size="icon" className="sm:hidden rounded-full h-10 w-10">
                    <Link href={contextLink}>
                      {contextName === 'Ruter' ? <RouteIcon className="h-5 w-5" /> : <FilePlus2 className="h-5 w-5" />}
                    </Link>
                  </Button>
                </div>
            )}`;

const newButtonRender = `{(isAdmin || contextName === 'Steder') && (
                <div className="flex items-center gap-2">
                  <Button asChild size="sm" className="hidden sm:flex">
                    <Link href={contextLink}>
                      {contextName === 'Ruter' ? <RouteIcon className="mr-2 h-4 w-4" /> : <FilePlus2 className="mr-2 h-4 w-4" />}
                      {contextName === 'Ruter' ? 'Ny Rute' : contextName === 'Personell' ? 'Nytt personell' : 'Nytt Sted'}
                    </Link>
                  </Button>
                  <Button asChild size="icon" className="sm:hidden rounded-full h-10 w-10">
                    <Link href={contextLink}>
                      {contextName === 'Ruter' ? <RouteIcon className="h-5 w-5" /> : <FilePlus2 className="h-5 w-5" />}
                    </Link>
                  </Button>
                </div>
            )}`;

code = code.replace(oldButtonRender, newButtonRender);

const oldSearchChange = `if (value && pathname !== '/dashboard' && !isRoutesPage && !isMonitorPage) {
        router.push('/dashboard');
    }`;

const newSearchChange = `const isWorkforcePage = pathname === '/dashboard/workforce';
    if (value && pathname !== '/dashboard' && !isRoutesPage && !isMonitorPage && !isWorkforcePage) {
        router.push('/dashboard');
    }`;

code = code.replace(oldSearchChange, newSearchChange);

fs.writeFileSync(filePath, code);
