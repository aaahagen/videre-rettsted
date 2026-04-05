const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/workforce/driver-profile-form.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const arbeidstidStartStr = '                    <Card className="bg-slate-50/50">\n                        <CardHeader>\n                            <div className="flex items-start justify-between">\n                                <div>\n                                    <CardTitle>Arbeidstid</CardTitle>';

const startIndex = content.indexOf(arbeidstidStartStr);

const nextCardStr = '                    <Card className="bg-slate-50/50">\n                         <CardHeader>\n                            <CardTitle>Avvik & Ferie</CardTitle>';
const endIndex = content.indexOf(nextCardStr);

const arbeidstidContent = content.slice(startIndex, endIndex);

// Remove the block from the original location
content = content.slice(0, startIndex) + content.slice(endIndex);

// Now we need to insert it AFTER the end of the two columns grid.
// The two columns are wrapped in: <div className="flex flex-col lg:flex-row items-start gap-6">
// And end right before: <div className="flex justify-end gap-3 border-t pt-6">

const endOfColsRegex = /                <\/div>\n            <\/div>\n\n            <div className="flex justify-end gap-3 border-t pt-6">/g;

content = content.replace(endOfColsRegex, 
    '                </div>\n            </div>\n\n            ' + 
    arbeidstidContent.trim() + 
    '\n\n            <div className="flex justify-end gap-3 border-t pt-6">'
);

fs.writeFileSync(filePath, content);
console.log('Moved Arbeidstid card successfully.');
