const fs = require('fs');
const file = 'src/app/dashboard/admin/admin-content.tsx';
let content = fs.readFileSync(file, 'utf8');

// Currently: <div className="p-2 sm:p-6 lg:p-8 max-w-full overflow-x-hidden">
// Let's constrain the width so it's not stretching too much on large screens.
const targetDiv = `<div className="p-2 sm:p-6 lg:p-8 max-w-full overflow-x-hidden">`;
const newDiv = `<div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-x-hidden w-full">`;

content = content.replace(targetDiv, newDiv);
fs.writeFileSync(file, content);
