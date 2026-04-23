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

// Add class to secondary image wrapper
code = code.replace(
  '<div key={index} className="flex flex-col items-center">',
  '<div key={index} className="flex flex-col items-center break-inside-avoid">'
);

// Add class to main image wrapper
code = code.replace(
  '<div className="mt-8">',
  '<div className="mt-8 break-inside-avoid">'
);


fs.writeFileSync('src/components/places/print-place.tsx', code);
