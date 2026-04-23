const fs = require('fs');
let code = fs.readFileSync('src/components/places/print-place.tsx', 'utf8');

const oldCss = `        @media print {
          @page { size: A4; margin: 20mm; }
          body { visibility: hidden; }
          .print-place-container { visibility: visible; position: absolute; left: 0; top: 0; width: 100%; }
          .page-break-after-always { page-break-after: always; }
          /* Hide everything else */
          nav, header, footer, .container, .sidebar { display: none !important; }
        }`;

const newCss = `        @media print {
          @page { size: A4; margin: 15mm; }
          body { visibility: hidden; }
          .print-place-container { visibility: visible; position: absolute; left: 0; top: 0; width: 100%; background: white; }
          .page-break-after-always { page-break-after: always; break-after: page; }
          .break-inside-avoid { page-break-inside: avoid; break-inside: avoid; }
          /* Better image handling on iOS */
          img { max-width: 100% !important; height: auto !important; page-break-inside: avoid; break-inside: avoid; }
          /* Hide everything else */
          nav, header, footer, .container, .sidebar, button { display: none !important; }
        }`;

code = code.replace(oldCss, newCss);


code = code.replace(
  '            {mainImage ? (\n                <div className="border border-gray-200 p-1">',
  '            {mainImage ? (\n                <div className="border border-gray-200 p-1 break-inside-avoid">'
);

code = code.replace(
  '              <div key={imgIndex} className="border border-gray-200 p-1 h-fit">',
  '              <div key={imgIndex} className="border border-gray-200 p-1 h-fit break-inside-avoid">'
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
  '                                  <span>{contact.email}</span>\n                              </div>\n                          )}\n                      </div>\n                  ))}',
  '                                  <span>{contact.email}</span>\n                              </div>\n                          )}\n                      </div>\n                      </div>\n                  ))}'
);


fs.writeFileSync('src/components/places/print-place.tsx', code);
