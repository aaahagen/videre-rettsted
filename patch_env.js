const fs = require('fs');

// We have the new Secret Manager key in place, so we must remove the plaintext env variable from functions/.env
// otherwise Firebase tries to mount both an env var and a secret with the same name.
fs.writeFileSync('functions/.env', '');
