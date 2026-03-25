const fs = require('fs');

const file = 'src/components/places/place-card.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /\? \`https:\/\/www\.google\.com\/maps\/dir\/\?api=1&destination=\$\{place\.coordinates\.lat\},\$\{place\.coordinates\.lng\}\`/g,
  `? \`https://www.google.com/maps/dir/?api=1&destination=\${place.coordinates?.lat},\${place.coordinates?.lng}\``
);

fs.writeFileSync(file, content);
