const fs = require('fs');

let code = fs.readFileSync('docs/CHANGELOG.md', 'utf8');

const oldEntry = `- **Door Code Overview on Favorites Page:** The Favorites page now includes a dedicated "Dørkoder / Nøkler" overview card at the top. This card aggregates and clearly displays all keys and access codes for the user's favorited places, making it extremely easy for drivers to find access codes quickly.`;

const newEntry = `- **Door Code Overview on Favorites Page:** The Favorites page now includes a dedicated "Nøkler" overview card at the top. This card aggregates and clearly displays all keys for the user's favorited places. It specifically filters out regular codes and only shows items categorized as "Nøkkel" alongside the place name (hiding the address for clarity).`;

code = code.replace(oldEntry, newEntry);

fs.writeFileSync('docs/CHANGELOG.md', code);
