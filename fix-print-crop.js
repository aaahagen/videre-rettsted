const fs = require('fs');
let code = fs.readFileSync('src/components/places/print-place.tsx', 'utf8');

// Convert main image styling for better print behavior
code = code.replace(
  '<div className="relative aspect-video w-full overflow-hidden bg-gray-100">',
  '<div className="relative w-full bg-gray-100 flex justify-center" style={{ minHeight: "200px" }}>'
);
code = code.replace(
  'className="object-cover w-full h-full"',
  'className="max-w-full max-h-[300px] object-contain"'
);

// Convert secondary images styling
code = code.replace(
  /<div className="relative aspect-video w-full overflow-hidden bg-gray-100">/g,
  '<div className="relative w-full bg-gray-100 flex justify-center" style={{ minHeight: "200px" }}>'
);
code = code.replace(
  /className="object-cover w-full h-full"/g,
  'className="max-w-full max-h-[300px] object-contain"'
);

// CSS fixes
code = code.replace(
  'img { max-width: 100% !important; height: auto !important; page-break-inside: avoid; break-inside: avoid; }',
  'img { max-width: 100% !important; max-height: 400px !important; object-fit: contain !important; page-break-inside: avoid; break-inside: avoid; }'
);


fs.writeFileSync('src/components/places/print-place.tsx', code);
