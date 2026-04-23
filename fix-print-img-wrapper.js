const fs = require('fs');
let code = fs.readFileSync('src/components/places/print-place.tsx', 'utf8');

code = code.replace(
  /<div className="mt-8">\n\s*<h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-4 flex items-center">/g,
  '<div className="mt-8 break-inside-avoid">\n            <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-4 flex items-center">'
);

code = code.replace(
  /<div key={index} className="flex flex-col items-center">/g,
  '<div key={index} className="flex flex-col items-center break-inside-avoid">'
);

fs.writeFileSync('src/components/places/print-place.tsx', code);
