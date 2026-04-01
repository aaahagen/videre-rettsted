const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/admin/admin-content.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add imports
if (!content.includes('DriverProfileForm')) {
    content = content.replace(
        "import { PendingInvitations } from '@/components/admin/pending-invitations';",
        "import { PendingInvitations } from '@/components/admin/pending-invitations';\nimport { DriverProfileForm } from '@/components/workforce/driver-profile-form';\nimport { DriverProfile } from '@/lib/types';"
    );
}

if (!content.includes('IdCard')) {
     content = content.replace(
        "Edit2, Settings",
        "Edit2, Settings, IdCard"
    );
}

// 2. Add action to UserActionsDropdown
const newAction = `
        {user.role === 'driver' && (
          <DropdownMenuItem onClick={onEditProfile}>
            <IdCard className="mr-2 h-4 w-4" />
            Rediger Sjåførprofil
          </DropdownMenuItem>
        )}
`;
if (!content.includes('Rediger Sjåførprofil')) {
    content = content.replace(
        "<DropdownMenuLabel>Handlinger</DropdownMenuLabel>",
        "<DropdownMenuLabel>Handlinger</DropdownMenuLabel>" + newAction
    );
    // Add onEditProfile to props
    content = content.replace(
        "function UserActionsDropdown({ user, handleUpdateRole, handleToggleStatus, handleDeleteUser, onEditName }",
        "function UserActionsDropdown({ user, handleUpdateRole, handleToggleStatus, handleDeleteUser, onEditName, onEditProfile }"
    );
}

// 3. Add state and handlers to AdminDashboardContent
if (!content.includes('editingDriverProfile')) {
    content = content.replace(
        "const [editingUser, setEditingUser] = useState<User | null>(null);",
        "const [editingUser, setEditingUser] = useState<User | null>(null);\n  const [editingDriverProfile, setEditingDriverProfile] = useState<DriverProfile | null>(null);"
    );

    const handleUpdateProfile = `
  const handleUpdateDriverProfile = async (data: Partial<DriverProfile>) => {
    if (!editingDriverProfile) return;
    try {
      await updateDoc(doc(db, 'users', editingDriverProfile.id), data);
      toast({
        title: "Profil oppdatert",
        description: "Sjåførprofilen ble lagret.",
      });
      setEditingDriverProfile(null);
    } catch (error: any) {
      toast({
        title: "Feil ved oppdatering",
        description: error.message,
        variant: "destructive",
      });
    }
  };
`;
    content = content.replace(
        "const handleUpdateName = async () => {",
        handleUpdateProfile + "\n  const handleUpdateName = async () => {"
    );

    // 4. Update the UserActionsDropdown usages in the Table and Mobile view
    content = content.replace(
        /onEditName=\{\(\) => \{\n\s*setEditingUser\(user\);\n\s*setNewName\(user\.name \|\| ''\);\n\s*\}\}/g,
        `onEditName={() => {\n                                  setEditingUser(user);\n                                  setNewName(user.name || '');\n                                }}\n                                onEditProfile={() => setEditingDriverProfile(user as DriverProfile)}`
    );

    // 5. Add the Dialog at the bottom
    const dialogHTML = `
        {/* Edit Driver Profile Dialog */}
        <Dialog open={!!editingDriverProfile} onOpenChange={(open) => !open && setEditingDriverProfile(null)}>
          <DialogContent className="sm:max-w-xl w-[95vw] rounded-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Rediger Sjåførprofil</DialogTitle>
              <DialogDescription>
                Oppdater ferdigheter, arbeidstid og sertifiseringer for {editingDriverProfile?.name || editingDriverProfile?.email}.
              </DialogDescription>
            </DialogHeader>
            {editingDriverProfile && (
              <DriverProfileForm 
                  user={editingDriverProfile} 
                  onSubmit={handleUpdateDriverProfile} 
                  onCancel={() => setEditingDriverProfile(null)} 
              />
            )}
          </DialogContent>
        </Dialog>
`;
    content = content.replace(
        "{/* Edit Name Dialog */}",
        dialogHTML + "\n        {/* Edit Name Dialog */}"
    );

    fs.writeFileSync(filePath, content);
    console.log('Patched AdminDashboardContent');
} else {
    console.log('AdminDashboardContent already patched');
}
