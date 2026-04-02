const fs = require('fs');
const path = require('path');

let adminContentPath = path.join(__dirname, 'src/app/dashboard/admin/admin-content.tsx');
let adminContentCode = fs.readFileSync(adminContentPath, 'utf8');

// Update Role options in Create User Form
const oldRoleSelect = `<Select
                  value={role}
                  onValueChange={(value: 'driver' | 'admin') => setRole(value as any)}
                >
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue placeholder="Velg en rolle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="driver">Sjåfør</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>`;

const newRoleSelect = `<Select
                  value={role}
                  onValueChange={(value: 'driver' | 'admin' | 'contractor') => setRole(value as any)}
                >
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue placeholder="Velg en rolle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="driver">Fast Sjåfør</SelectItem>
                    <SelectItem value="contractor">Innleid (Ekstern)</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>`;

adminContentCode = adminContentCode.replace(
    `<Select
                  value={role}
                  onValueChange={(value: 'driver' | 'admin') => setRole(value)}
                >
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue placeholder="Velg en rolle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="driver">Sjåfør</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>`, newRoleSelect);


// Add role state with 'contractor' option
adminContentCode = adminContentCode.replace(
    "const [role, setRole] = useState<'driver' | 'admin'>('driver');",
    "const [role, setRole] = useState<'driver' | 'admin' | 'contractor'>('driver');"
);

// Update dropdown menu
const newRoleDropdownItems = `        {user.role === 'admin' ? (
          <DropdownMenuItem onClick={() => handleUpdateRole(user.id, 'driver')}>
            <Shield className="mr-2 h-4 w-4" />
            Gjør til Fast Sjåfør
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => handleUpdateRole(user.id, 'admin')}>
            <ShieldAlert className="mr-2 h-4 w-4" />
            Gjør til Admin
          </DropdownMenuItem>
        )}
        {user.role !== 'contractor' && (
          <DropdownMenuItem onClick={() => handleUpdateRole(user.id, 'contractor')}>
             <UserIcon className="mr-2 h-4 w-4" />
             Gjør til Innleid (Ekstern)
          </DropdownMenuItem>
        )}
        {user.role === 'contractor' && (
          <DropdownMenuItem onClick={() => handleUpdateRole(user.id, 'driver')}>
             <Shield className="mr-2 h-4 w-4" />
             Gjør til Fast Sjåfør
          </DropdownMenuItem>
        )}`;

adminContentCode = adminContentCode.replace(
    `        {user.role === 'admin' ? (
          <DropdownMenuItem onClick={() => handleUpdateRole(user.id, 'driver')}>
            <Shield className="mr-2 h-4 w-4" />
            Gjør til Sjåfør
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => handleUpdateRole(user.id, 'admin')}>
            <ShieldAlert className="mr-2 h-4 w-4" />
            Gjør til Admin
          </DropdownMenuItem>
        )}`, newRoleDropdownItems);

const renderBadgeRegex = /{user\.role === 'admin' \? 'Admin' : 'Sjåfør'}/g;
adminContentCode = adminContentCode.replace(renderBadgeRegex, "{user.role === 'admin' ? 'Admin' : user.role === 'contractor' ? 'Innleid' : 'Fast Sjåfør'}");

const bgBadgeRegex = /className=\{user\.role === 'admin' \? 'bg-primary' : ''\}/g;
adminContentCode = adminContentCode.replace(bgBadgeRegex, "className={user.role === 'admin' ? 'bg-primary' : user.role === 'contractor' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' : ''}");

const variantBadgeRegex = /variant=\{user\.role === 'admin' \? 'default' : 'secondary'\}/g;
adminContentCode = adminContentCode.replace(variantBadgeRegex, "variant={user.role === 'admin' ? 'default' : user.role === 'contractor' ? 'outline' : 'secondary'}");


fs.writeFileSync(adminContentPath, adminContentCode);
