const fs = require('fs');
let code = fs.readFileSync('src/components/places/print-place.tsx', 'utf8');

code = code.replace(
  '            {mainImage ? (\n                <div className="border border-gray-200 p-1">',
  '            {mainImage ? (\n                <div className="border border-gray-200 p-1 break-inside-avoid">'
);

code = code.replace(
  '<div className="grid grid-cols-2 gap-4">',
  '<div className="grid grid-cols-2 gap-4 break-inside-avoid">'
);

code = code.replace(
  '                  {place.contactPersons.map((contact, index) => (',
  '                  {place.contactPersons.map((contact, index) => (\n                      <div key={index} className="break-inside-avoid">'
);

code = code.replace(
  '                      <div key={index} className="p-3 border border-gray-200 rounded-md bg-gray-50 flex flex-col gap-1">',
  '                      <div className="p-3 border border-gray-200 rounded-md bg-gray-50 flex flex-col gap-1">'
);

code = code.replace(
  '                          )}',
  '                          )}\n                      </div>'
);

code = code.replace(
  '                          )}',
  '                          )}\n                      </div>'
);

fs.writeFileSync('src/components/places/print-place.tsx', code);
