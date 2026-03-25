const fs = require('fs');
const usersFile = 'functions/src/users.ts';
let usersContent = fs.readFileSync(usersFile, 'utf8');

usersContent = usersContent.replace(
  /export const deleteUser = functions\.https\.onCall\(async \(request, context\) => \{/g,
  `export const deleteUser = functions.https.onCall(async (request) => {
    const auth = request.auth;`
);

fs.writeFileSync(usersFile, usersContent);
