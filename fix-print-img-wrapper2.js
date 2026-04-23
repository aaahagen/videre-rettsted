const fs = require('fs');
let code = fs.readFileSync('src/components/places/print-place.tsx', 'utf8');

code = code.replace(
  '        {mainImage && (',
  '        {mainImage && (\n          <div className="mt-8 break-inside-avoid">'
);
code = code.replace(
  '              )}',
  '              )}\n          </div>'
);

fs.writeFileSync('src/components/places/print-place.tsx', code);
