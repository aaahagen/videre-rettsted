const fs = require('fs');

let code = fs.readFileSync('docs/CHANGELOG.md', 'utf8');

const newEntry = `### Added
- **Door Code / Key Management for Places:** Added a dynamic "Dørkode / Nøkkel" field to the place form. Users can now add multiple keys or codes for a single place, categorizing them as "Nøkkel" or "Kode", and adding custom descriptions (e.g., "Hovedinngang"). Admins can toggle this feature and set default labels/placeholders in the organization settings.
- **Door Code Overview on Favorites Page:** The Favorites page now includes a dedicated "Dørkoder / Nøkler" overview card at the top. This card aggregates and clearly displays all keys and access codes for the user's favorited places, making it extremely easy for drivers to find access codes quickly.
`;

code = code.replace('### Added\n', newEntry);

fs.writeFileSync('docs/CHANGELOG.md', code);
