const fs = require('fs');
const file = 'functions/src/routes.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /    const waypoints = placeDocs\n      \.map\(\(doc\) => \{\n        const place = doc\.data\(\);\n        if \(place\?\.coordinates\) \{\n          return \{ lat: place\.coordinates\.lat, lng: place\.coordinates\.lng \};\n        \}\n        return null;\n      \}\)\n      \.filter\(\(p\): p is \{ lat: number; lng: number \} => p !== null\);/g,
  `    const waypoints = placeDocs
      .map((doc) => {
        const place = doc.data();
        if (place?.coordinates && place.coordinates.lat !== 0 && place.coordinates.lng !== 0) {
          return { lat: place.coordinates.lat, lng: place.coordinates.lng };
        }
        if (place?.address) {
            return place.address;
        }
        return null;
      })
      .filter((p): p is { lat: number; lng: number } | string => p !== null && p !== '');`
);

fs.writeFileSync(file, content);
