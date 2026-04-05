const fs = require('fs');
const path = require('path');

const formPath = path.join(__dirname, 'src/components/workforce/driver-profile-form.tsx');
let content = fs.readFileSync(formPath, 'utf8');

// Remove extra closing tag
content = content.replace(`                                </div>
                            </div>
                            <div className="space-y-2 mt-4 pt-4 border-t">`, `                                </div>
                            <div className="space-y-2 mt-4 pt-4 border-t">`);

fs.writeFileSync(formPath, content);
console.log("Fixed HR html final");
