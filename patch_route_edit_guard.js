const fs = require('fs');
const file = 'src/app/dashboard/routes/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Also need to guard the Edit button for drivers if route is completed
const targetEditButton = `{!isAdmin && (
                  <Button 
                    variant={isEditMode ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setIsEditMode(!isEditMode)}
                    className="flex items-center gap-2"
                  >
                      {isEditMode ? (
                          <>
                            <X className="h-4 w-4" /> Avslutt redigering
                          </>
                      ) : (
                          <>
                            <Edit2 className="h-4 w-4" /> Rediger Rute
                          </>
                      )}`;

const newEditButton = `{!isAdmin && route?.status !== 'completed' && (
                  <Button 
                    variant={isEditMode ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setIsEditMode(!isEditMode)}
                    className="flex items-center gap-2"
                  >
                      {isEditMode ? (
                          <>
                            <X className="h-4 w-4" /> Avslutt redigering
                          </>
                      ) : (
                          <>
                            <Edit2 className="h-4 w-4" /> Rediger Rute
                          </>
                      )}`;

content = content.replace(targetEditButton, newEditButton);
fs.writeFileSync(file, content);
