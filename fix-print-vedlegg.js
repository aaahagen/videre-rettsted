const fs = require('fs');
let code = fs.readFileSync('src/components/places/print-place.tsx', 'utf8');

// Change images logic to ensure vedlegg are actually printed as attachments

code = code.replace(
  '  for (let i = 0; i < secondaryImages.length; i += 4) {',
  '  // Only include secondary images if they exist and are valid\n  const validSecondary = secondaryImages.filter(img => img.url && img.url !== "/ingen.jpg");\n  for (let i = 0; i < validSecondary.length; i += 4) {'
);

code = code.replace(
  '    secondaryImagePages.push(secondaryImages.slice(i, i + 4));',
  '    secondaryImagePages.push(validSecondary.slice(i, i + 4));'
);

fs.writeFileSync('src/components/places/print-place.tsx', code);
