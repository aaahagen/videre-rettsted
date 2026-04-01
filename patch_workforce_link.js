const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/workforce/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace the button in the list to be a Link opening in a new tab
const newButton = `
                                                <Button variant="secondary" size="sm" asChild>
                                                    <a href={\`/dashboard/workforce/print?driverId=\${driver.id}&date=\${searchDate.toISOString()}\`} target="_blank" rel="noopener noreferrer">
                                                        <Printer className="mr-2 h-4 w-4" />
                                                        Plan (12 uker)
                                                    </a>
                                                </Button>
`;

content = content.replace(
    /<Button variant="secondary" size="sm" onClick=\{[^\}]+\}>\s*<Printer className="mr-2 h-4 w-4" \/>\s*Plan \(12 uker\)\s*<\/Button>/,
    newButton
);

// We can also safely remove the Dialog and printWeeks calculation from this file since it's moved to the new page.
// This cleans up the main page significantly.

// Remove dialog state
content = content.replace(/const \[printDriver, setPrintDriver\] = useState<DriverProfile \| null>\(null\);\n/, '');

// Remove handlePrint
content = content.replace(/const handlePrint = \(\) => \{\n\s*window\.print\(\);\n\s*\};\n/, '');

// Remove printWeeks calculation
content = content.replace(/\/\/ Generate the 12-week grid data[\s\S]*?printWeeks\.push\(\{ startDate: weekStart, days \}\);\n\s*\}\n\s*\}/, '');

// Remove the Dialog component completely
content = content.replace(/{\/\* Dialog for Previewing Print \*\/}Theme[\s\S]*?<\/Dialog>/, '');
content = content.replace(/<Dialog[\s\S]*?<\/Dialog>/, ''); // Catch all for the dialog

// Remove the Print Only content completely
content = content.replace(/{\/\* PRINT ONLY CONTENT \*\/}[\s\S]*?<\/div>\s*\)\}/, '');

fs.writeFileSync(filePath, content);
console.log('Patched WorkforcePage to use separate print tab');
