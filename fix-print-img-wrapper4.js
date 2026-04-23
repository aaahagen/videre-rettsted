const fs = require('fs');
let code = fs.readFileSync('src/components/places/print-place.tsx', 'utf8');

code = code.replace(
  '              <div key={imgIndex} className="border border-gray-200 p-1 h-fit">',
  '              <div key={imgIndex} className="border border-gray-200 p-1 h-fit break-inside-avoid">'
);

fs.writeFileSync('src/components/places/print-place.tsx', code);
