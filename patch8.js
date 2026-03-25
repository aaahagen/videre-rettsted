const fs = require('fs');

const routesFile = 'functions/src/routes.ts';
let routesContent = fs.readFileSync(routesFile, 'utf8');
routesContent = routesContent.replace(
  /export const calculateRouteDistance = functions\.https\.onCall\(async \(data, context\) => \{/g,
  `export const calculateRouteDistance = functions.https.onCall(async (request) => {
    const data = request.data;
    const auth = request.auth;`
);
routesContent = routesContent.replace(/context\.auth/g, 'auth');
fs.writeFileSync(routesFile, routesContent);

const usersFile = 'functions/src/users.ts';
let usersContent = fs.readFileSync(usersFile, 'utf8');
usersContent = usersContent.replace(
  /export const getUserData = functions\.https\.onCall\(async \(data, context\) => \{/g,
  `export const getUserData = functions.https.onCall(async (request) => {
    const data = request.data;
    const auth = request.auth;`
);
usersContent = usersContent.replace(
  /export const updateUserRole = functions\.https\.onCall\(async \(data, context\) => \{/g,
  `export const updateUserRole = functions.https.onCall(async (request) => {
    const data = request.data;
    const auth = request.auth;`
);
usersContent = usersContent.replace(/context\.auth/g, 'auth');
fs.writeFileSync(usersFile, usersContent);

const invFile = 'functions/src/invitations.ts';
let invContent = fs.readFileSync(invFile, 'utf8');
invContent = invContent.replace(
  /export const createInvitation = functions\.https\.onCall\(async \(data, context\) => \{/g,
  `export const createInvitation = functions.https.onCall(async (request) => {
    const data = request.data;
    const auth = request.auth;`
);
invContent = invContent.replace(
  /export const acceptInvitation = functions\.https\.onCall\(async \(data, context\) => \{/g,
  `export const acceptInvitation = functions.https.onCall(async (request) => {
    const data = request.data;
    const auth = request.auth;`
);
invContent = invContent.replace(/context\.auth/g, 'auth');
fs.writeFileSync(invFile, invContent);

